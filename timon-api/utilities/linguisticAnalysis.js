import axios from "axios";

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

    return { label: "UNKNOWN", score: 0.5 };
  } catch (error) {
    console.log("❌✔️ Fall Back");
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
      return { label: "Fake", score: 0.7 };
    }
  }

  // Check for very long, complex words (AI often uses more sophisticated vocabulary)
  const longWords = words.filter((w) => w.length > 10);
  if (longWords.length > words.length * 0.1) {
    // More than 10% long words suggests AI
    return { label: "Fake", score: 0.6 };
  }

  // Default to human if no AI patterns detected
  return { label: "Real", score: 0.6 };
}

/**
 * Decision tree to classify the review based on linguistic and behavioral analysis
 * @param {string} linguisticTag - The linguistic analysis result
 * @param {string} behavioralTag - The behavioral analysis result
 * @returns {"real" | "fake" | "needs_review" | "suspicious"}
 */
function classifyReview(linguisticTag, behavioralTag) {
  if (linguisticTag === "Real" && behavioralTag === "human") {
    return "real";
  } else if (linguisticTag === "Fake" && behavioralTag === "suspicious") {
    return "fake";
  } else if (linguisticTag === "Fake" && behavioralTag === "human") {
    return "needs_review";
  } else if (linguisticTag === "Real" && behavioralTag === "suspicious") {
    return "suspicious";
  } else {
    // Default case if tags don't match expected values
    return "needs_review";
  }
}

const analyzeLinguistic = async (reviewText, behavioralTag) => {
  // Perform linguistic analysis
  const { label: linguisticTag, score: linguisticScore } =
    await analyzeTextWithHuggingFaceAPI(reviewText);

  // Classify the review using the decision tree
  const finalClassification = classifyReview(linguisticTag, behavioralTag);

  return {
    linguisticTag,
    linguisticScore,
    finalClassification,
  };
};

export default analyzeLinguistic;
