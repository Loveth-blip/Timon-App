/**
 * Linguistic Analysis Lambda Function
 *
 * This Lambda function performs linguistic analysis on review text to determine if it's human or AI-generated,
 * then combines this with behavioral analysis results to classify the review.
 *
 * The function:
 * 1. Receives review text and behavioral tag
 * 2. Uses a transformer model to detect if the review is human or AI-generated
 * 3. Combines with behavioral analysis results using a decision tree
 * 4. Updates the review in Firestore with the classification
 */

const admin = require("firebase-admin");
const axios = require("axios");
require("dotenv").config();

// Initialize Firebase
let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  if (firebaseApp === null) {
    // Load service account key from environment variables
    const serviceAccountInfo = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountInfo),
    });
  }
  return admin.firestore();
}

/**
 * Use Hugging Face Inference API to detect if text is AI-generated
 * @param {string} text - The text to analyze
 * @returns {Promise<{label: string, score: number}>}
 */
async function analyzeTextWithHuggingFaceAPI(text) {
  const API_URL =
    "https://api-inference.huggingface.co/models/openai-community/roberta-base-openai-detector";

  const headers = {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(API_URL, { inputs: text }, { headers });
    const result = response.data;

    // Handle different response formats
    if (Array.isArray(result) && result.length > 0) {
      if (Array.isArray(result[0])) {
        // Format: [[{"label": "LABEL1", "score": 0.123}, {"label": "LABEL2", "score": 0.456}]]
        const predictions = result[0];
        // Find the prediction with the highest score
        const prediction = predictions.reduce((max, current) =>
          (current.score || 0) > (max.score || 0) ? current : max
        );
        return { label: prediction.label, score: prediction.score || 0 };
      } else if (typeof result[0] === "object") {
        // Format: [{"label": "LABEL", "score": 0.123}]
        return { label: result[0].label, score: result[0].score || 0 };
      }
    }

    // If we can't parse the result, return a default
    console.log(`Unexpected response format from Hugging Face API:`, result);
    return { label: "UNKNOWN", score: 0.5 };
  } catch (error) {
    console.error(`Error calling Hugging Face API:`, error.message);
    // Fallback to a simple heuristic
    return fallbackTextAnalysis(text);
  }
}

/**
 * Simple fallback heuristic if the API call fails
 * @param {string} text - The text to analyze
 * @returns {{label: string, score: number}}
 */
function fallbackTextAnalysis(text) {
  // Very simple heuristics (would be more sophisticated in production)
  const words = text.split(/\s+/);

  // Check for very uniform sentence lengths (AI often produces uniform text)
  const sentences = text
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length > 3) {
    const sentenceLengths = sentences.map((s) => s.length);
    const mean =
      sentenceLengths.reduce((sum, len) => sum + len, 0) /
      sentenceLengths.length;
    const variance =
      sentenceLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) /
      sentenceLengths.length;

    if (variance < 100) {
      // Low variance in sentence length suggests AI
      return { label: "AI-GENERATED", score: 0.7 };
    }
  }

  // Check for very long, complex words (AI often uses more sophisticated vocabulary)
  const longWords = words.filter((w) => w.length > 10);
  if (longWords.length > words.length * 0.1) {
    // More than 10% long words suggests AI
    return { label: "AI-GENERATED", score: 0.6 };
  }

  // Default to human if no AI patterns detected
  return { label: "HUMAN", score: 0.6 };
}

/**
 * Decision tree to classify the review based on linguistic and behavioral analysis
 * @param {string} linguisticTag - The linguistic analysis result
 * @param {string} behavioralTag - The behavioral analysis result
 * @returns {"real" | "fake" | "needs_review" | "suspicious"}
 */
function classifyReview(linguisticTag, behavioralTag) {
  if (linguisticTag === "HUMAN" && behavioralTag === "human") {
    return "real";
  } else if (
    linguisticTag === "AI-GENERATED" &&
    behavioralTag === "suspicious"
  ) {
    return "fake";
  } else if (linguisticTag === "AI-GENERATED" && behavioralTag === "human") {
    return "needs_review";
  } else if (linguisticTag === "HUMAN" && behavioralTag === "suspicious") {
    return "suspicious";
  } else {
    // Default case if tags don't match expected values
    return "needs_review";
  }
}

/**
 * Update the review in Firestore with linguistic analysis results and final classification
 * @param {string} reviewId - The review ID
 * @param {string} linguisticTag - The linguistic analysis tag
 * @param {number} linguisticScore - The linguistic analysis score
 * @param {string} finalClassification - The final classification
 */
async function updateReviewInFirestore(
  reviewId,
  linguisticTag,
  linguisticScore,
  finalClassification
) {
  const db = initializeFirebase();

  // Update the review document
  const reviewRef = db.collection("reviews").doc(reviewId);
  await reviewRef.update({
    "tags.linguistic": linguisticTag,
    "tags.linguisticScore": linguisticScore,
    "tags.finalDecision": finalClassification,
    "tags.analysisComplete": true,
  });

  console.log(
    `Updated review ${reviewId} with classification: ${finalClassification}`
  );
}

/**
 * Lambda handler function
 * @param {Object} event - The Lambda event object
 * @param {Object} context - The Lambda context object
 * @returns {Promise<Object>} - The response object
 */
exports.handler = async (event, context) => {
  try {
    // Check if data is in the body (common in API Gateway events)
    let eventData = event.body || event;
    if (typeof eventData === "string") {
      try {
        eventData = JSON.parse(eventData);
      } catch (parseError) {
        eventData = event;
      }
    }

    // Extract data from the event
    const { reviewId, reviewText, behavioralTag } = eventData;

    // Validate required fields
    if (!reviewId || !reviewText || !behavioralTag) {
      console.log("Missing required fields in event");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Perform linguistic analysis
    const { label: linguisticTag, score: linguisticScore } =
      await analyzeTextWithHuggingFaceAPI(reviewText);

    // Classify the review using the decision tree
    const finalClassification = classifyReview(linguisticTag, behavioralTag);

    // Update the review in Firestore
    await updateReviewInFirestore(
      reviewId,
      linguisticTag,
      linguisticScore,
      finalClassification
    );

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        reviewId: reviewId,
        linguisticTag: linguisticTag,
        finalClassification: finalClassification,
      }),
    };
  } catch (error) {
    console.error(`Error processing review:`, error);

    // Return error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Error processing review",
        message: error.message,
      }),
    };
  }
};

// Export internal functions for testing
exports.analyzeTextWithHuggingFaceAPI = analyzeTextWithHuggingFaceAPI;
exports.fallbackTextAnalysis = fallbackTextAnalysis;
exports.classifyReview = classifyReview;
exports.updateReviewInFirestore = updateReviewInFirestore;
