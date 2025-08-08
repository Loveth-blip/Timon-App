/**
 * Analyze behavioral data to determine if the review is likely from a real user
 * @param {Object} behavioralData - Behavioral biometrics data
 * @returns {Object} - Analysis results
 */
export default function analyzeBehavioralData(behavioralData) {
  // Extract metrics from behavioral data
  const {
    typingSpeed,
    typingRhythm,
    pausePatterns,
    editingPatterns,
    totalTimeSpent,
  } = behavioralData;

  // Simple scoring system (this would be more sophisticated in production)
  let score = 0;
  let maxScore = 0;
  let reasons = [];

  // Check typing speed (humans typically have variable typing speeds)
  if (typingSpeed && typingSpeed.variance > 0.2) {
    score += 1;
    reasons.push("Natural typing speed variance detected");
  } else if (typingSpeed) {
    reasons.push("Uniform typing speed detected (suspicious)");
  }
  maxScore += 1;

  // Check typing rhythm (humans have natural pauses and rhythm)
  if (typingRhythm && typingRhythm.naturalPauses > 3) {
    score += 1;
    reasons.push("Natural typing rhythm detected");
  } else if (typingRhythm) {
    reasons.push("Mechanical typing rhythm detected (suspicious)");
  }
  maxScore += 1;

  // Check pause patterns (humans pause to think)
  if (pausePatterns && pausePatterns.longPauses > 1) {
    score += 1;
    reasons.push("Natural thinking pauses detected");
  } else if (pausePatterns) {
    reasons.push("No thinking pauses detected (suspicious)");
  }
  maxScore += 1;

  // Check editing patterns (humans make mistakes and correct them)
  if (editingPatterns && editingPatterns.corrections > 0) {
    score += 1;
    reasons.push("Natural editing behavior detected");
  } else if (editingPatterns) {
    reasons.push("No editing or corrections detected (suspicious)");
  }
  maxScore += 1;

  // Check total time spent (humans take time to write reviews)
  if (totalTimeSpent && totalTimeSpent > 30) {
    // More than 30 seconds
    score += 1;
    reasons.push("Natural time spent writing review");
  } else if (totalTimeSpent) {
    reasons.push("Review written too quickly (suspicious)");
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
    behavioralTag: isHumanBehavior ? "human" : "suspicious",
  };
}
