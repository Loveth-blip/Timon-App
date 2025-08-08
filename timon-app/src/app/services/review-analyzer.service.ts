import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { BehavioralBiometricsService } from './behavioral-biometrics.service';
import {
  BehavioralData,
  BehavioralDataProcessed,
  Review,
  ReviewData,
  ReviewTags,
} from '../models/review.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReviewAnalyzerService {
  private apiUrl = environment.reviewApiUrl;

  constructor(
    private http: HttpClient,
    private firebaseService: FirebaseService,
    private behavioralService: BehavioralBiometricsService
  ) {}

  /**
   * Submit a new review with behavioral data and analyze it using AWS Lambda
   */
  submitReview(payload: ReviewData): Observable<string> {
    // Call the AWS Lambda function
    return this.http.post<any>(`${this.apiUrl}/reviews`, payload).pipe(
      map((response) => {
        if (response.success && response.reviewId) {
          return response.reviewId;
        } else {
          throw new Error(response.message || 'Failed to submit review');
        }
      }),
      catchError((error) => {
        console.error('Error submitting review:', error);

        // Fallback to local processing if the API call fails
        return this.processReviewLocally(payload);
      })
    );
  }

  /**
   * Format behavioral data for the API
   */
  formatBehavioralData(data: BehavioralData): BehavioralDataProcessed {
    // Calculate typing rhythm metrics
    const typingRhythm = {
      naturalPauses: data.idleTimes.length,
    };

    // Calculate pause patterns
    const pausePatterns = {
      longPauses: data.idleTimes.filter((time) => time > 3000).length,
    };

    // Calculate editing patterns
    const editingPatterns = {
      corrections: data.backspaceCount,
    };

    // Calculate variance from keystroke timings
    const typingSpeedVariance = this.calculateTypingSpeedVariance(data);

    // Format the data for the API
    return {
      typingSpeed: {
        average: data.typingSpeed,
        variance: typingSpeedVariance,
      },
      typingRhythm,
      pausePatterns,
      editingPatterns,
      totalTimeSpent: data.typingDuration / 1000, // Convert to seconds
    };
  }

  /**
   * Fallback method to process the review locally if the API call fails
   */
  private processReviewLocally(reviewData: ReviewData): Observable<string> {
    const {
      userId,
      productId,
      reviewText,
      behavioralDataRaw,
      behavioralData,
      rating,
    } = reviewData;
    // Initial tags with pending status
    const initialTags: ReviewTags = {
      behavioral: 'pending',
      linguistic: 'pending',
      finalDecision: 'pending',
    };

    // Create the review object
    const review: Review = {
      userId,
      productId,
      reviewText,
      // createdAt: new Date(),
      tags: initialTags,
      rating,
      behavioralData,
    };

    // Save the review to Firestore
    return this.firebaseService.addDocument<Review>('reviews', review).pipe(
      map((docRef) => {
        const reviewId = docRef.id;

        // Perform behavioral analysis locally
        const behavioralTag =
          this.behavioralService.analyzeBehavior(behavioralDataRaw as BehavioralData);

        // Set a default linguistic tag (since we can't perform linguistic analysis locally)
        const linguisticTag = 'human';

        // Update the review with analysis results
        const updatedTags: ReviewTags = {
          behavioral: behavioralTag,
          linguistic: linguisticTag as any,
          finalDecision: this.makeLocalDecision(
            behavioralTag,
            linguisticTag as any
          ),
        };

        // Update the review in Firestore
        this.firebaseService
          .updateDocument<Review>('reviews', reviewId, {
            tags: updatedTags,
          })
          .subscribe();

        return reviewId;
      })
    );
  }

  /**
   * Apply decision tree logic for local processing
   */
  private makeLocalDecision(
    behavioralTag: 'human' | 'suspicious' | 'pending',
    linguisticTag: 'Real' | 'Fake' | 'pending'
  ): 'suspicious' | 'real' | 'fake' | 'needs_review' | 'pending' {
    // Simplified decision logic for local processing
    if (behavioralTag === 'human' && linguisticTag === 'Real') {
      return 'real';
    } else {
      return 'suspicious';
    }
  }

  /**
   * Get reviews for a specific product
   */
  getProductReviews(productId: string): Observable<Review[]> {
    return this.firebaseService.getFilteredCollection<Review>(
      'reviews',
      'productId',
      productId
    );
  }

  /**
   * Get reviews by a specific user
   */
  getUserReviews(userId: string): Observable<Review[]> {
    return this.firebaseService.getFilteredCollection<Review>(
      'reviews',
      'userId',
      userId
    );
  }

  /**
   * Manually update the review classification
   */
  updateReviewClassification(
    reviewId: string,
    finalDecision: 'flagged' | 'real' | 'fake' | 'confirmed'
  ): Observable<void> {
    return this.firebaseService.updateDocument<Review>('reviews', reviewId, {
      tags: { finalDecision } as any,
    });
  }

  /**
   * Calculate the variance of typing speed from available behavioral data
   * Higher variance indicates more inconsistent typing rhythm (more human-like)
   * Lower variance indicates more consistent typing (potentially automated)
   */
  private calculateTypingSpeedVariance(data: BehavioralData): number {
    // If we don't have enough data, return a default value
    if (!data.idleTimes || data.idleTimes.length === 0) {
      return 0.3; // Default fallback value
    }

    // Calculate variance from idle times (pauses in typing)
    // This is a good proxy for typing rhythm variance
    let idleVariance = 0;
    if (data.idleTimes.length > 1) {
      // Calculate mean of idle times
      const idleMean =
        data.idleTimes.reduce((sum, val) => sum + val, 0) /
        data.idleTimes.length;

      // Calculate variance of idle times
      idleVariance =
        data.idleTimes.reduce((sum, val) => {
          const diff = val - idleMean;
          return sum + diff * diff;
        }, 0) / data.idleTimes.length;
    }

    // Factor in other behavioral indicators
    // More backspaces and mouse movements typically indicate human behavior
    // which correlates with higher variance in typing patterns
    const correctionFactor = Math.min(data.backspaceCount / 10, 1); // Normalize to 0-1
    const mouseMovementFactor = Math.min(data.mouseMovements / 50, 1); // Normalize to 0-1

    // Combine factors to estimate overall typing variance
    // This is a heuristic approach that would be refined with real-world data
    let estimatedVariance = 0.2; // Base variance

    // Add contribution from idle time variance (normalized)
    estimatedVariance += Math.min(idleVariance / 5000, 0.4);

    // Add contribution from correction behaviors
    estimatedVariance += correctionFactor * 0.2;

    // Add contribution from mouse movements
    estimatedVariance += mouseMovementFactor * 0.2;

    // Ensure variance is within 0-1 range
    estimatedVariance = Math.min(Math.max(estimatedVariance, 0), 1);

    return parseFloat(estimatedVariance.toFixed(2)); // Return with 2 decimal places
  }
}
