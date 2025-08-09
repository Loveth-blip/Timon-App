const analyzeBehavioralRawData = (behavioralData) => {
  // Simple heuristic rules for behavioral analysis
  // These thresholds would need to be tuned based on real-world data

  // Very fast typing + no backspaces + pasting detected => Likely fake
  if (
    behavioralData.typingSpeed < 100 &&
    behavioralData.backspaceCount === 0 &&
    behavioralData.pasteCount > 0
  ) {
    return {
      behavioralTag: "suspicious",
      score: 0,
      reasons: [
        "Very fast typing + no backspaces + pasting detected => Likely fake",
      ],
    };
  }

  // Very consistent typing speed with no pauses => Likely fake
  if (
    behavioralData.idleTimes.length === 0 &&
    behavioralData.typingDuration > 5000
  ) {
    return {
      behavioralTag: "suspicious",
      score: 0,
      reasons: ["Very consistent typing speed with no pauses => Likely fake"],
    };
  }

  // Natural typing speed + corrections + mouse movements => Likely real
  if (behavioralData.backspaceCount > 0 && behavioralData.mouseMovements > 10) {
    return {
      behavioralTag: "human",
      score: 1,
      reasons: [
        "Natural typing speed + corrections + mouse movements => Likely real",
      ],
    };
  }

  // Default to real if no suspicious patterns detected
  return {
    behavioralTag: "human",
    score: 1,
    reasons: ["Default to real if no suspicious patterns detected"],
  };
};

/**
 * Analyze behavioral data to determine if the review is likely from a real user
 * Uses weighted scoring and dynamic thresholds for more accurate detection
 * @param {Object} behavioralData - Behavioral biometrics data
 * @returns {Object} - Analysis results
 */
const analyzeBehavioralData = (behavioralData) => {
  // Add debugging and validation
  if (!behavioralData) {
    console.log("Behavioral analysis: No behavioral data provided");
    return {
      score: 0,
      isHumanBehavior: false,
      reasons: ["No behavioral data available"],
      behavioralTag: "suspicious",
    };
  }

  // Extract metrics from behavioral data
  const {
    typingSpeed,
    typingRhythm,
    pausePatterns,
    editingPatterns,
    totalTimeSpent,
  } = behavioralData;

  console.log("Behavioral analysis input:", {
    typingSpeed,
    typingRhythm,
    pausePatterns,
    editingPatterns,
    totalTimeSpent,
  });

  // Initialize scoring system with weights
  let totalScore = 0;
  let maxPossibleScore = 0;
  let reasons = [];
  let suspiciousFlags = 0;

  // 1. Typing Speed Analysis (Weight: 25%)
  const typingSpeedScore = analyzeTypingSpeed(typingSpeed);
  totalScore += typingSpeedScore.score * 0.25;
  maxPossibleScore += 0.25;
  reasons.push(...typingSpeedScore.reasons);
  if (typingSpeedScore.suspicious) suspiciousFlags++;

  // 2. Typing Rhythm Analysis (Weight: 20%)
  const rhythmScore = analyzeTypingRhythm(typingRhythm);
  totalScore += rhythmScore.score * 0.2;
  maxPossibleScore += 0.2;
  reasons.push(...rhythmScore.reasons);
  if (rhythmScore.suspicious) suspiciousFlags++;

  // 3. Pause Pattern Analysis (Weight: 20%)
  const pauseScore = analyzePausePatterns(pausePatterns);
  totalScore += pauseScore.score * 0.2;
  maxPossibleScore += 0.2;
  reasons.push(...pauseScore.reasons);
  if (pauseScore.suspicious) suspiciousFlags++;

  // 4. Editing Behavior Analysis (Weight: 15%)
  const editingScore = analyzeEditingPatterns(editingPatterns);
  totalScore += editingScore.score * 0.15;
  maxPossibleScore += 0.15;
  reasons.push(...editingScore.reasons);
  if (editingScore.suspicious) suspiciousFlags++;

  // 5. Time Analysis (Weight: 20%)
  const timeScore = analyzeTimeSpent(totalTimeSpent);
  totalScore += timeScore.score * 0.2;
  maxPossibleScore += 0.2;
  reasons.push(...timeScore.reasons);
  if (timeScore.suspicious) suspiciousFlags++;

  // Calculate final percentage score
  const finalScore =
    maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  // Dynamic threshold based on suspicious flags
  let threshold = 60; // Base threshold
  if (suspiciousFlags >= 3)
    threshold = 80; // Higher threshold if multiple suspicious patterns
  else if (suspiciousFlags >= 2) threshold = 70; // Medium threshold
  else if (suspiciousFlags === 0) threshold = 50; // Lower threshold if no suspicious patterns

  // Determine if behavior appears human
  const isHumanBehavior = finalScore >= threshold;

  console.log("Behavioral analysis result:", {
    score: finalScore,
    threshold,
    suspiciousFlags,
    isHumanBehavior,
    reasons,
    behavioralTag: isHumanBehavior ? "human" : "suspicious",
  });

  return {
    score: finalScore,
    isHumanBehavior,
    reasons,
    behavioralTag: isHumanBehavior ? "human" : "suspicious",
  };
};

export { analyzeBehavioralRawData, analyzeBehavioralData };

/**
 * Analyze typing speed patterns
 */
function analyzeTypingSpeed(typingSpeed) {
  if (!typingSpeed || typingSpeed.variance === undefined) {
    return {
      score: 0,
      reasons: ["No typing speed data available"],
      suspicious: true,
    };
  }

  const variance = typingSpeed.variance;
  let score = 0;
  let reasons = [];
  let suspicious = false;

  // Natural human typing has moderate variance (0.1 - 0.8)
  if (variance >= 0.1 && variance <= 0.8) {
    score = 1.0;
    reasons.push("Natural typing speed variance detected");
  } else if (variance > 0.8) {
    score = 0.7; // Very high variance might be suspicious
    reasons.push("High typing speed variance (potentially erratic)");
    suspicious = true;
  } else if (variance < 0.05) {
    score = 0.2; // Very low variance is suspicious
    reasons.push("Uniform typing speed detected (suspicious)");
    suspicious = true;
  } else {
    score = 0.5; // Moderate variance
    reasons.push("Moderate typing speed variance");
  }

  return { score, reasons, suspicious };
}

/**
 * Analyze typing rhythm and natural pauses
 */
function analyzeTypingRhythm(typingRhythm) {
  if (!typingRhythm || typingRhythm.naturalPauses === undefined) {
    return {
      score: 0,
      reasons: ["No typing rhythm data available"],
      suspicious: true,
    };
  }

  const pauses = typingRhythm.naturalPauses;
  let score = 0;
  let reasons = [];
  let suspicious = false;

  // Humans typically have 2-8 natural pauses during typing
  if (pauses >= 2 && pauses <= 8) {
    score = 1.0;
    reasons.push("Natural typing rhythm with appropriate pauses");
  } else if (pauses > 8) {
    score = 0.6; // Too many pauses might be suspicious
    reasons.push("Excessive pauses detected (potentially suspicious)");
    suspicious = true;
  } else if (pauses === 0) {
    score = 0.3; // No pauses is very suspicious
    reasons.push("No natural pauses detected (highly suspicious)");
    suspicious = true;
  } else {
    score = 0.7; // Some pauses but not optimal
    reasons.push("Limited natural pauses detected");
  }

  return { score, reasons, suspicious };
}

/**
 * Analyze pause patterns for thinking time
 */
function analyzePausePatterns(pausePatterns) {
  if (!pausePatterns || pausePatterns.longPauses === undefined) {
    return {
      score: 0,
      reasons: ["No pause pattern data available"],
      suspicious: true,
    };
  }

  const longPauses = pausePatterns.longPauses;
  let score = 0;
  let reasons = [];
  let suspicious = false;

  // Humans typically have 1-3 long pauses while thinking
  if (longPauses >= 1 && longPauses <= 3) {
    score = 1.0;
    reasons.push("Natural thinking pauses detected");
  } else if (longPauses > 3) {
    score = 0.5; // Too many long pauses might be suspicious
    reasons.push("Excessive long pauses detected (potentially suspicious)");
    suspicious = true;
  } else if (longPauses === 0) {
    score = 0.4; // No long pauses is suspicious
    reasons.push("No thinking pauses detected (suspicious)");
    suspicious = true;
  } else {
    score = 0.8; // Some long pauses
    reasons.push("Limited thinking pauses detected");
  }

  return { score, reasons, suspicious };
}

/**
 * Analyze editing and correction patterns
 */
function analyzeEditingPatterns(editingPatterns) {
  if (!editingPatterns || editingPatterns.corrections === undefined) {
    return {
      score: 0,
      reasons: ["No editing pattern data available"],
      suspicious: true,
    };
  }

  const corrections = editingPatterns.corrections;
  let score = 0;
  let reasons = [];
  let suspicious = false;

  // Humans typically make 1-5 corrections during writing
  if (corrections >= 1 && corrections <= 5) {
    score = 1.0;
    reasons.push("Natural editing behavior detected");
  } else if (corrections > 5) {
    score = 0.6; // Too many corrections might be suspicious
    reasons.push("Excessive corrections detected (potentially suspicious)");
    suspicious = true;
  } else if (corrections === 0) {
    score = 0.3; // No corrections is suspicious
    reasons.push("No editing or corrections detected (suspicious)");
    suspicious = true;
  } else {
    score = 0.8; // Some corrections
    reasons.push("Limited editing behavior detected");
  }

  return { score, reasons, suspicious };
}

/**
 * Analyze time spent writing the review
 */
function analyzeTimeSpent(totalTimeSpent) {
  if (!totalTimeSpent || totalTimeSpent === undefined) {
    return {
      score: 0,
      reasons: ["No time spent data available"],
      suspicious: true,
    };
  }

  const timeInSeconds = totalTimeSpent;
  let score = 0;
  let reasons = [];
  let suspicious = false;

  // Humans typically spend 15-120 seconds writing a review
  if (timeInSeconds >= 15 && timeInSeconds <= 120) {
    score = 1.0;
    reasons.push("Natural time spent writing review");
  } else if (timeInSeconds > 120) {
    score = 0.7; // Very long time might be suspicious
    reasons.push("Excessive time spent (potentially suspicious)");
    suspicious = true;
  } else if (timeInSeconds < 8) {
    score = 0.2; // Too quick is very suspicious
    reasons.push("Review written too quickly (highly suspicious)");
    suspicious = true;
  } else if (timeInSeconds < 15) {
    score = 0.5; // Quick but not impossible
    reasons.push("Quick review writing (suspicious)");
    suspicious = true;
  } else {
    score = 0.8; // Reasonable time
    reasons.push("Reasonable time spent writing review");
  }

  return { score, reasons, suspicious };
}
