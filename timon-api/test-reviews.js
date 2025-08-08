// Test file to demonstrate the review endpoints
// Run this with: node test-reviews.js

const sampleReview = {
  "userId": "user123",
  "productId": "EGEyue0WpGGIMwXAzCmD",
  "reviewText": "This is a really nice product.",
  "behavioralDataRaw": {
    "typingSpeed": 354.59375,
    "typingDuration": 15447,
    "backspaceCount": 1,
    "pasteCount": 0,
    "mouseMovements": 4,
    "idleTimes": []
  },
  "behavioralData": {
    "typingSpeed": {
      "average": 354.59375,
      "variance": 0.3
    },
    "typingRhythm": {
      "naturalPauses": 0
    },
    "pausePatterns": {
      "longPauses": 0
    },
    "editingPatterns": {
      "corrections": 1
    },
    "totalTimeSpent": 15.447
  },
  "rating": 5
};

// Example API calls (assuming server is running on localhost:3000)

// 1. Create a review
const createReview = async () => {
  const response = await fetch('http://localhost:3000/api/v1/review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sampleReview)
  });
  
  const result = await response.json();
  console.log('Review created:', result);
  return result.data.review._id;
};

// 2. Get all reviews
const getAllReviews = async () => {
  const response = await fetch('http://localhost:3000/api/v1/review');
  const result = await response.json();
  console.log('All reviews:', result);
};

// 3. Get reviews by product
const getReviewsByProduct = async (productId) => {
  const response = await fetch(`http://localhost:3000/api/v1/review/product/${productId}`);
  const result = await response.json();
  console.log('Reviews by product:', result);
};

// 4. Get reviews by user
const getReviewsByUser = async (userId) => {
  const response = await fetch(`http://localhost:3000/api/v1/review/user/${userId}`);
  const result = await response.json();
  console.log('Reviews by user:', result);
};

// 5. Get a single review
const getReview = async (reviewId) => {
  const response = await fetch(`http://localhost:3000/api/v1/review/${reviewId}`);
  const result = await response.json();
  console.log('Review by ID:', result);
};

// 6. Update a review
const updateReview = async (reviewId, updateData) => {
  const response = await fetch(`http://localhost:3000/api/v1/review/${reviewId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData)
  });
  
  const result = await response.json();
  console.log('Review updated:', result);
};

// 7. Mark review as helpful
const markReviewHelpful = async (reviewId) => {
  const response = await fetch(`http://localhost:3000/api/v1/review/${reviewId}/helpful`, {
    method: 'PATCH'
  });
  
  const result = await response.json();
  console.log('Review marked as helpful:', result);
};

// 8. Report a review
const reportReview = async (reviewId) => {
  const response = await fetch(`http://localhost:3000/api/v1/review/${reviewId}/report`, {
    method: 'PATCH'
  });
  
  const result = await response.json();
  console.log('Review reported:', result);
};

// 9. Get suspicious reviews
const getSuspiciousReviews = async () => {
  const response = await fetch('http://localhost:3000/api/v1/review/suspicious');
  const result = await response.json();
  console.log('Suspicious reviews:', result);
};

// 10. Update review analysis
const updateReviewAnalysis = async (reviewId, analysisData) => {
  const response = await fetch(`http://localhost:3000/api/v1/review/${reviewId}/analysis`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ analysisData })
  });
  
  const result = await response.json();
  console.log('Review analysis updated:', result);
};

// Example usage:
console.log('Review API Test Examples:');
console.log('1. Create review: createReview()');
console.log('2. Get all reviews: getAllReviews()');
console.log('3. Get reviews by product: getReviewsByProduct("product_id")');
console.log('4. Get reviews by user: getReviewsByUser("user_id")');
console.log('5. Get review by ID: getReview("review_id")');
console.log('6. Update review: updateReview("review_id", { rating: 4 })');
console.log('7. Mark review helpful: markReviewHelpful("review_id")');
console.log('8. Report review: reportReview("review_id")');
console.log('9. Get suspicious reviews: getSuspiciousReviews()');
console.log('10. Update analysis: updateReviewAnalysis("review_id", { tags: { finalDecision: "approved" } })');

// Export functions for use in other files
export {
  createReview,
  getAllReviews,
  getReviewsByProduct,
  getReviewsByUser,
  getReview,
  updateReview,
  markReviewHelpful,
  reportReview,
  getSuspiciousReviews,
  updateReviewAnalysis,
  sampleReview
};
