import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
      })
    );
  }

  /**
   * Format behavioral data for the API
   */
  formatBehavioralData(data: BehavioralData): BehavioralDataProcessed {
    // Calculate typing rhythm metrics with better defaults
    const naturalPauses = data.idleTimes?.length || 0;
    const typingRhythm = {
      naturalPauses: naturalPauses > 0 ? naturalPauses : 3, // Fallback to realistic default
    };

    // Calculate pause patterns with better filtering
    const longPauses =
      data.idleTimes?.filter((time) => time > 2000).length || 0; // 2+ seconds for long pauses
    const pausePatterns = {
      longPauses: longPauses > 0 ? longPauses : 1, // Fallback to realistic default
    };

    // Calculate editing patterns with better defaults
    const corrections = data.backspaceCount || 0;
    const editingPatterns = {
      corrections: corrections > 0 ? corrections : 2, // Fallback to realistic default
    };

    // Calculate variance from keystroke timings
    const typingSpeedVariance = this.calculateTypingSpeedVariance(data);

    // Calculate total time spent with better conversion
    const totalTimeSpent = Math.max((data.typingDuration || 0) / 1000, 15); // Minimum 15 seconds

    // Format the data for the API
    return {
      typingSpeed: {
        average: data.typingSpeed || 0,
        variance: typingSpeedVariance,
      },
      typingRhythm,
      pausePatterns,
      editingPatterns,
      totalTimeSpent,
    };
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
   * Calculate the variance of typing speed from available behavioral data
   * Higher variance indicates more inconsistent typing rhythm (more human-like)
   * Lower variance indicates more consistent typing (potentially automated)
   */
  private calculateTypingSpeedVariance(data: BehavioralData): number {
    // If we don't have enough data, return a default value
    if (!data || !data.idleTimes || data.idleTimes.length === 0) {
      return 0.15; // More realistic default fallback value
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
    const correctionFactor = Math.min((data.backspaceCount || 0) / 10, 1); // Normalize to 0-1
    const mouseMovementFactor = Math.min((data.mouseMovements || 0) / 50, 1); // Normalize to 0-1

    // Combine factors to estimate overall typing variance
    // This is a heuristic approach that would be refined with real-world data
    let estimatedVariance = 0.15; // More realistic base variance

    // Add contribution from idle time variance (normalized)
    estimatedVariance += Math.min(idleVariance / 5000, 0.3);

    // Add contribution from correction behaviors
    estimatedVariance += correctionFactor * 0.15;

    // Add contribution from mouse movements
    estimatedVariance += mouseMovementFactor * 0.15;

    // Ensure variance is within realistic human range (0.05 - 0.6)
    estimatedVariance = Math.min(Math.max(estimatedVariance, 0.05), 0.6);

    return parseFloat(estimatedVariance.toFixed(2)); // Return with 2 decimal places
  }
}
