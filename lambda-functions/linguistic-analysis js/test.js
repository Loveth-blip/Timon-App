#!/usr/bin/env node
/**
 * Test script for the linguistic analysis Lambda function.
 * This script simulates invoking the Lambda function locally.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Check if required packages are installed, install if not
function checkAndInstallDependencies() {
  const requiredPackages = ["firebase-admin", "axios", "dotenv"];
  const packageJsonPath = path.join(__dirname, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.log("package.json not found. Creating...");
    const packageJson = {
      name: "linguistic-analysis-lambda",
      version: "1.0.0",
      description: "Lambda function for linguistic analysis",
      main: "index.js",
      dependencies: {
        "firebase-admin": "^12.0.0",
        axios: "^1.6.0",
        dotenv: "^16.3.0",
      },
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("package.json created successfully.");
  }

  try {
    // Check if node_modules exists
    if (!fs.existsSync(path.join(__dirname, "node_modules"))) {
      console.log("Dependencies not installed. Running npm install...");
      execSync("npm install", { stdio: "inherit", cwd: __dirname });
      console.log("Dependencies installed successfully.");
    }
  } catch (error) {
    console.error("Error installing dependencies:", error.message);
    console.log('Please run "npm install" manually before running this test.');
  }
}

// Check if .env file exists, create from .env.example if not
function setupEnvironmentFile() {
  const envPath = path.join(__dirname, ".env");
  const envExamplePath = path.join(__dirname, ".env.example");

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log(".env file not found. Creating from .env.example...");
    const exampleContent = fs.readFileSync(envExamplePath, "utf8");
    fs.writeFileSync(envPath, exampleContent);
    console.log(".env file created successfully.");
  }
}

// Setup environment and dependencies
checkAndInstallDependencies();
setupEnvironmentFile();

// Import the linguistic analyser after environment setup
const linguisticAnalyser = require("./index"); // Assuming your main file is index.js

/**
 * Test the lambda handler function with a sample event
 */
async function testLambdaHandler() {
  // Sample event that would be sent from the review-api Lambda
  const event = {
    reviewId: "vsCRS37IPGbeijR2Wtso",
    // reviewId: 'test-review-123',
    reviewText:
      "This is a test review. I really enjoyed using this product. It has great features and works as expected.",
    behavioralTag: "human",
  };

  // Call the lambda handler
  console.log("Invoking lambda handler with test event...");
  try {
    const response = await linguisticAnalyser.handler(event, {});

    // Print the response
    console.log("\nResponse:");
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error invoking lambda handler:", error.message);
  }
}

/**
 * Test the text analysis function directly
 */
async function testAnalyzeText() {
  // Sample review texts to test
  const reviewTexts = [
    // Human-like review
    "I bought this product last week and I've been using it daily. It's not perfect - the battery life could be better, but overall I'm happy with my purchase. The design is sleek and it fits well in my hand.",
    // AI-generated review (more formal, structured)
    "I am writing this review to share my experience with this exceptional product. The product exhibits remarkable quality and functionality. The design is aesthetically pleasing and the performance exceeds expectations. I would highly recommend this product to anyone seeking a solution in this category.",
  ];

  console.log("\nTesting text analysis directly...");

  // Import the internal functions (you may need to export these from your main module)
  const {
    analyzeTextWithHuggingFaceAPI,
    fallbackTextAnalysis,
  } = require("./index");

  for (let i = 0; i < reviewTexts.length; i++) {
    const text = reviewTexts[i];
    console.log(`\nSample ${i + 1}:`);
    console.log(`Text: ${text.substring(0, 100)}...`);

    try {
      const { label: tag, score } = await analyzeTextWithHuggingFaceAPI(text);
      console.log(`Result: ${tag} (confidence: ${score.toFixed(2)})`);

      // If the API call fails, it will fall back to the heuristic analysis
      // Let's test that directly too
      const { label: fallbackTag, score: fallbackScore } =
        fallbackTextAnalysis(text);
      console.log(
        `Fallback analysis: ${fallbackTag} (confidence: ${fallbackScore.toFixed(
          2
        )})`
      );
    } catch (error) {
      console.error(`Error analyzing text ${i + 1}:`, error.message);
    }
  }
}

/**
 * Test the decision tree classification logic
 */
function testDecisionTree() {
  // Test all combinations of linguistic and behavioral tags
  const linguisticTags = ["HUMAN", "AI-GENERATED"];
  const behavioralTags = ["human", "suspicious"];

  console.log("\nTesting decision tree classification:");

  // Import the classification function
  const { classifyReview } = require("./index");

  for (const lingTag of linguisticTags) {
    for (const behavTag of behavioralTags) {
      const classification = classifyReview(lingTag, behavTag);
      console.log(
        `Linguistic: ${lingTag}, Behavioral: ${behavTag} => Classification: ${classification}`
      );
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("=== Linguistic Analysis Lambda Function Test ===\n");

  try {
    // Test the lambda handler
    await testLambdaHandler();

    // Test the text analysis function
    await testAnalyzeText();

    // Test the decision tree
    testDecisionTree();

    console.log("\n=== Test Complete ===");
  } catch (error) {
    console.error("Test execution failed:", error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testLambdaHandler,
  testAnalyzeText,
  testDecisionTree,
  runTests,
};
