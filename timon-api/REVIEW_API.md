# Review API Documentation

This document describes the Review API endpoints for the Timon application.

## Base URL
```
http://localhost:3000/api/v1/review
```

## Endpoints

### 1. Create a Review
**POST** `/api/v1/review`

Creates a new review with behavioral data.

**Request Body:**
```json
{
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
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "review": {
      "_id": "review_id",
      "userId": "user123",
      "productId": "EGEyue0WpGGIMwXAzCmD",
      "reviewText": "This is a really nice product.",
      "rating": 5,
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
      "behavioralDataRaw": {
        "typingSpeed": 354.59375,
        "typingDuration": 15447,
        "backspaceCount": 1,
        "pasteCount": 0,
        "mouseMovements": 4,
        "idleTimes": []
      },
      "tags": {
        "linguistic": "Real",
        "behavioralScore": 0,
        "behavioralReasons": [],
        "linguisticScore": 0,
        "behavioral": "real",
        "analysisComplete": false,
        "finalDecision": "needs_review"
      },
      "isActive": true,
      "isVerified": false,
      "helpfulCount": 0,
      "reportCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. Get All Reviews
**GET** `/api/v1/review`

Retrieves all reviews from the database.

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "userId": "user123",
        "productId": {
          "_id": "EGEyue0WpGGIMwXAzCmD",
          "title": "Smartphone X"
        },
        "reviewText": "This is a really nice product.",
        "rating": 5,
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
        "tags": {
          "linguistic": "Real",
          "behavioralScore": 0,
          "behavioralReasons": [],
          "linguisticScore": 0,
          "behavioral": "real",
          "analysisComplete": false,
          "finalDecision": "needs_review"
        },
        "status": "pending",
        "trustScore": 0
      }
    ]
  }
}
```

### 3. Get Reviews by Product
**GET** `/api/v1/review/product/:productId`

Retrieves all reviews for a specific product.

**Query Parameters:**
- `rating` (optional): Filter by rating (1-5)
- `status` (optional): Filter by status (approved, rejected, pending)

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "userId": "user123",
        "productId": "EGEyue0WpGGIMwXAzCmD",
        "reviewText": "This is a really nice product.",
        "rating": 5,
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
        "tags": {
          "linguistic": "Real",
          "behavioralScore": 0,
          "behavioralReasons": [],
          "linguisticScore": 0,
          "behavioral": "real",
          "analysisComplete": false,
          "finalDecision": "needs_review"
        },
        "status": "pending",
        "trustScore": 0
      }
    ]
  }
}
```

### 4. Get Reviews by User
**GET** `/api/v1/review/user/:userId`

Retrieves all reviews by a specific user.

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "userId": "user123",
        "productId": "EGEyue0WpGGIMwXAzCmD",
        "reviewText": "This is a really nice product.",
        "rating": 5,
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
        "tags": {
          "linguistic": "Real",
          "behavioralScore": 0,
          "behavioralReasons": [],
          "linguisticScore": 0,
          "behavioral": "real",
          "analysisComplete": false,
          "finalDecision": "needs_review"
        },
        "status": "pending",
        "trustScore": 0
      }
    ]
  }
}
```

### 5. Get a Single Review
**GET** `/api/v1/review/:id`

Retrieves a single review by its ID.

**Response:**
```json
{
  "status": "success",
  "data": {
    "review": {
      "_id": "review_id",
      "userId": "user123",
      "productId": "EGEyue0WpGGIMwXAzCmD",
      "reviewText": "This is a really nice product.",
      "rating": 5,
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
      "behavioralDataRaw": {
        "typingSpeed": 354.59375,
        "typingDuration": 15447,
        "backspaceCount": 1,
        "pasteCount": 0,
        "mouseMovements": 4,
        "idleTimes": []
      },
      "tags": {
        "linguistic": "Real",
        "behavioralScore": 0,
        "behavioralReasons": [],
        "linguisticScore": 0,
        "behavioral": "real",
        "analysisComplete": false,
        "finalDecision": "needs_review"
      },
      "isActive": true,
      "isVerified": false,
      "helpfulCount": 0,
      "reportCount": 0,
      "status": "pending",
      "trustScore": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 6. Update a Review
**PATCH** `/api/v1/review/:id`

Updates a review by its ID.

**Request Body:**
```json
{
  "rating": 4,
  "reviewText": "Updated review text."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "review": {
      "_id": "review_id",
      "userId": "user123",
      "productId": "EGEyue0WpGGIMwXAzCmD",
      "reviewText": "Updated review text.",
      "rating": 4,
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
      "tags": {
        "linguistic": "Real",
        "behavioralScore": 0,
        "behavioralReasons": [],
        "linguisticScore": 0,
        "behavioral": "real",
        "analysisComplete": false,
        "finalDecision": "needs_review"
      },
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 7. Delete a Review
**DELETE** `/api/v1/review/:id`

Soft deletes a review by setting isActive to false.

**Response:**
```json
{
  "status": "success",
  "data": null
}
```

### 8. Mark Review as Helpful
**PATCH** `/api/v1/review/:id/helpful`

Increments the helpful count for a review.

**Response:**
```json
{
  "status": "success",
  "data": {
    "review": {
      "_id": "review_id",
      "helpfulCount": 1
    }
  }
}
```

### 9. Report a Review
**PATCH** `/api/v1/review/:id/report`

Increments the report count for a review.

**Response:**
```json
{
  "status": "success",
  "data": {
    "review": {
      "_id": "review_id",
      "reportCount": 1
    }
  }
}
```

### 10. Get Suspicious Reviews
**GET** `/api/v1/review/suspicious`

Retrieves all reviews marked as suspicious.

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "reviews": [
      {
        "_id": "review_id",
        "userId": "user123",
        "productId": "EGEyue0WpGGIMwXAzCmD",
        "reviewText": "This is a really nice product.",
        "rating": 5,
        "tags": {
          "behavioral": "suspicious",
          "analysisComplete": true,
          "finalDecision": "needs_review"
        }
      }
    ]
  }
}
```

### 11. Update Review Analysis
**PATCH** `/api/v1/review/:id/analysis`

Updates the analysis data for a review.

**Request Body:**
```json
{
  "analysisData": {
    "tags": {
      "linguistic": "Real",
      "behavioralScore": 85,
      "behavioralReasons": ["natural_typing_pattern"],
      "linguisticScore": 0.9,
      "behavioral": "real",
      "analysisComplete": true,
      "finalDecision": "approved"
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "review": {
      "_id": "review_id",
      "tags": {
        "linguistic": "Real",
        "behavioralScore": 85,
        "behavioralReasons": ["natural_typing_pattern"],
        "linguisticScore": 0.9,
        "behavioral": "real",
        "analysisComplete": true,
        "finalDecision": "approved"
      }
    }
  }
}
```

## Review Schema

The review model includes the following fields:

- **reviewText** (required): Review content (10-2000 characters)
- **rating** (required): Rating (1-5, integer)
- **userId** (required): User ID who wrote the review
- **productId** (required): Product ID being reviewed
- **behavioralData** (optional): Processed behavioral data
- **behavioralDataRaw** (optional): Raw behavioral data
- **tags** (optional): Analysis tags and scores
- **isActive** (optional): Review availability (default: true)
- **isVerified** (optional): Review verification status (default: false)
- **helpfulCount** (optional): Number of helpful votes (default: 0)
- **reportCount** (optional): Number of reports (default: 0)
- **createdAt** (auto): Creation timestamp
- **updatedAt** (auto): Last update timestamp

## Behavioral Data Schema

The behavioral data includes:

- **typingSpeed**: Average and variance of typing speed
- **typingRhythm**: Natural pauses in typing
- **pausePatterns**: Long pauses during typing
- **editingPatterns**: Corrections and edits
- **totalTimeSpent**: Total time spent writing the review

## Tags Schema

The tags include:

- **linguistic**: Linguistic analysis result (Real, Fake, Suspicious)
- **behavioralScore**: Behavioral analysis score (0-100)
- **behavioralReasons**: Reasons for behavioral score
- **linguisticScore**: Linguistic analysis score (0-1)
- **behavioral**: Behavioral analysis result (real, suspicious, fake)
- **analysisComplete**: Whether analysis is complete
- **finalDecision**: Final decision (approved, rejected, needs_review)

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Please provide userId, productId, reviewText, and rating"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "No review found with that ID"
}
```

## Testing

Use the provided `test-reviews.js` file to test the endpoints with sample data.

```bash
# Start the server
npm start

# Test the endpoints using the sample data
node test-reviews.js
```
