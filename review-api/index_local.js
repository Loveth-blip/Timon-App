/**
 * Review API Lambda Function
 * 
 * This Lambda function handles the review submission process:
 * 1. Receives review data from the frontend
 * 2. Performs behavioral analysis
 * 3. Saves the review to Firestore
 * 4. Calls the linguistic analysis microservice asynchronously
 */

const AWS = require('aws-sdk');
const admin = require('firebase-admin');
const lambda = new AWS.Lambda();

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebase() {
  // Check if required environment variables are set
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_DATABASE_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (!firebaseInitialized) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    firebaseInitialized = true;
  }
  return admin.firestore();
}

/**
 * Analyze behavioral data to determine if the review is likely from a real user
 * @param {Object} behavioralData - Behavioral biometrics data
 * @returns {Object} - Analysis results
 */
function analyzeBehavioralData(behavioralData) {
  // Extract metrics from behavioral data
  const {
    typingSpeed,
    typingRhythm,
    pausePatterns,
    editingPatterns,
    totalTimeSpent
  } = behavioralData;

  // Simple scoring system (this would be more sophisticated in production)
  let score = 0;
  let maxScore = 0;
  let reasons = [];

  // Check typing speed (humans typically have variable typing speeds)
  if (typingSpeed && typingSpeed.variance > 0.2) {
    score += 1;
    reasons.push('Natural typing speed variance detected');
  } else if (typingSpeed) {
    reasons.push('Uniform typing speed detected (suspicious)');
  }
  maxScore += 1;

  // Check typing rhythm (humans have natural pauses and rhythm)
  if (typingRhythm && typingRhythm.naturalPauses > 3) {
    score += 1;
    reasons.push('Natural typing rhythm detected');
  } else if (typingRhythm) {
    reasons.push('Mechanical typing rhythm detected (suspicious)');
  }
  maxScore += 1;

  // Check pause patterns (humans pause to think)
  if (pausePatterns && pausePatterns.longPauses > 1) {
    score += 1;
    reasons.push('Natural thinking pauses detected');
  } else if (pausePatterns) {
    reasons.push('No thinking pauses detected (suspicious)');
  }
  maxScore += 1;

  // Check editing patterns (humans make mistakes and correct them)
  if (editingPatterns && editingPatterns.corrections > 0) {
    score += 1;
    reasons.push('Natural editing behavior detected');
  } else if (editingPatterns) {
    reasons.push('No editing or corrections detected (suspicious)');
  }
  maxScore += 1;

  // Check total time spent (humans take time to write reviews)
  if (totalTimeSpent && totalTimeSpent > 30) { // More than 30 seconds
    score += 1;
    reasons.push('Natural time spent writing review');
  } else if (totalTimeSpent) {
    reasons.push('Review written too quickly (suspicious)');
  }
  maxScore += 1;

  // Calculate final score as a percentage
  const finalScore = maxScore > 0 ? (score / maxScore) * 100 : 0;

  // Determine if the behavior appears human
  const isHumanBehavior = finalScore >= 60; // 60% threshold

  return {
    score: finalScore,
    isHumanBehavior,
    reasons,
    behavioralTag: isHumanBehavior ? 'human' : 'suspicious'
  };
}

/**
 * Call the linguistic analysis Lambda function asynchronously
 * @param {Object} reviewData - The review data including the review ID
 */
async function callLinguisticAnalysis(reviewData) {
  const params = {
    FunctionName: process.env.LINGUISTIC_ANALYSIS_FUNCTION,
    InvocationType: 'Event', // Asynchronous invocation
    Payload: JSON.stringify({
      reviewId: reviewData.id,
      reviewText: reviewData.text,
      behavioralTag: reviewData.behavioralTag
    })
  };

  try {
    await lambda.invoke(params).promise();
    console.log(`Linguistic analysis triggered for review ${reviewData.id}`);
  } catch (error) {
    console.error('Error invoking linguistic analysis:', error);
    // We don't throw here since this is asynchronous and shouldn't block the response
  }
}

/**
 * Save the review to Firestore
 * @param {Object} reviewData - The review data
 * @returns {string} - The ID of the saved review
 */
async function saveReviewToFirestore(reviewData) {
  const db = initializeFirebase();
  
  // Prepare review document
  const reviewDoc = {
    userId: reviewData.userId,
    productId: reviewData.productId,
    text: reviewData.reviewText,
    rating: reviewData.rating || 5,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    behavioralTag: reviewData.behavioralAnalysis.behavioralTag,
    behavioralScore: reviewData.behavioralAnalysis.score,
    behavioralReasons: reviewData.behavioralAnalysis.reasons,
    linguisticTag: 'pending', // Will be updated by the linguistic analysis Lambda
    finalClassification: 'pending' // Will be updated by the linguistic analysis Lambda
  };

  // Save to Firestore
  const docRef = await db.collection('reviews').add(reviewDoc);
  return docRef.id;
}

/**
 * Lambda handler function
 */
exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    // const requestBody = JSON.parse(event.body || '{}');
    // const { reviewText, behavioralData, userId, productId, rating } = requestBody;
    const { reviewText, behavioralData, userId, productId, rating } = event || {};  

    // Validate required fields
    if (!reviewText || !userId || !productId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Perform behavioral analysis
    const behavioralAnalysis = analyzeBehavioralData(behavioralData);

    // Prepare review data
    const reviewData = {
      reviewText,
      userId,
      productId,
      rating,
      behavioralAnalysis
    };

    // Save review to Firestore
    const reviewId = await saveReviewToFirestore(reviewData);

    // Call linguistic analysis Lambda asynchronously
    await callLinguisticAnalysis({
      id: reviewId,
      text: reviewText,
      behavioralTag: behavioralAnalysis.behavioralTag
    });

    // Return success response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        reviewId,
        message: 'Review submitted successfully and is being analyzed'
      })
    };
  } catch (error) {
    console.error('Error processing review:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Error processing review',
        message: error.message
      })
    };
  }
};
