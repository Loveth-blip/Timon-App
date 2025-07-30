# Timon - Behavioral and Linguistic Review Analyzer

Timon is an Angular application that enhances review authenticity by combining behavioral biometrics and linguistic forensics to detect fake reviews.

## Features

- **Behavioral Biometrics**: Analyzes typing patterns, mouse movements, and other behavioral signals to verify authenticity.
- **Linguistic Forensics**: Detects patterns in text that distinguish between human-written and AI-generated content.
- **Combined Analysis**: Merges behavioral and linguistic signals to provide a comprehensive authenticity score.
- **User Authentication**: Secure login and registration system.
- **Product Management**: Browse and view product details.
- **Review System**: Submit and view reviews with authenticity verification.
- **Purchase Tracking**: Track purchases and write reviews for purchased products.

## Technology Stack

- **Frontend**: Angular 17 with standalone components
- **Backend**: Firebase (Authentication, Firestore)
- **Styling**: SCSS with custom variables and utility classes

## Project Structure

The project follows a feature-based architecture:

```
src/
├── app/
│   ├── core/              # Core components (layout, header, footer)
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication features
│   │   ├── products/      # Product listing and details
│   │   ├── reviews/       # Review submission and listing
│   │   └── purchases/     # Purchase tracking and checkout
│   ├── models/            # Data models
│   └── services/          # Shared services
├── assets/                # Static assets
└── environments/          # Environment configurations
```

## Services

- **FirebaseService**: Handles Firebase authentication and Firestore operations
- **BehavioralBiometricsService**: Tracks and analyzes user behavior during review writing
- **LinguisticAnalysisService**: Analyzes text for AI-generated patterns
- **ReviewAnalyzerService**: Combines behavioral and linguistic analysis

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Angular CLI (v17 or later)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd timon-app
   npm install
   ```
3. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update the Firebase configuration in `src/environments/environment.ts`

### Running the Application

```
ng serve
```

Navigate to `http://localhost:4200/` to view the application.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Future Enhancements

- Admin dashboard for managing products and reviewing flagged reviews
- Machine learning integration for improved linguistic analysis
- Mobile application with native behavioral tracking
- Integration with e-commerce platforms
