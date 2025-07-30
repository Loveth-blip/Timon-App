export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyDoBX6xM8l19ao08PE1xEpGsDJzkToQ_rc",
    authDomain: "timon-469a2.firebaseapp.com",
    projectId: "timon-469a2",
    storageBucket: "timon-469a2.firebasestorage.app",
    messagingSenderId: "934331486855",
    appId: "1:934331486855:web:de86a61bac54d2f5a45e22",
    measurementId: "G-H3NVNEKKRG"
  },
  // API URLs for AWS Lambda functions (production endpoints)
  reviewApiUrl: 'https://zwzpnmdjgn7w2jylmxbd4zyo2y0mobxu.lambda-url.us-east-1.on.aws', // Replace with actual production API Gateway URL
  linguisticApiUrl: 'https://api.timon.com/v1/linguistic' // Replace with actual production API Gateway URL
};
