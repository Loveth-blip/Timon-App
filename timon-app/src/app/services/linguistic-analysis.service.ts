import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LinguisticAnalysisService {
  private apiUrl = environment.linguisticApiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Analyzes the review text to determine if it's AI-generated or human-written
   * This calls the AWS Lambda function for linguistic analysis
   */
  analyzeText(text: string): Observable<'AI' | 'human'> {
    // Prepare the request payload
    const payload = {
      text: text
    };

    // Call the AWS Lambda function
    return this.http.post<any>(`${this.apiUrl}/analyze`, payload).pipe(
      map(response => {
        if (response.success && response.linguisticTag) {
          // Convert the response to the expected format
          return response.linguisticTag === 'AI-GENERATED' ? 'AI' : 'human';
        } else {
          throw new Error(response.message || 'Failed to analyze text');
        }
      }),
      catchError(error => {
        console.error('Error analyzing text:', error);

        // Fallback to local analysis if the API call fails
        return this.performLocalAnalysis(text);
      })
    );
  }

  /**
   * Fallback method to analyze text locally if the API call fails
   */
  private performLocalAnalysis(text: string): Observable<'AI' | 'human'> {
    // Simulate API call delay
    return of(this.performAnalysis(text)).pipe(delay(1000));
  }

  /**
   * Simple heuristic analysis of text
   * This is a very simplified version for demo purposes
   * Used as a fallback when the API is unavailable
   */
  private performAnalysis(text: string): 'AI' | 'human' {
    // Convert to lowercase for analysis
    const lowerText = text.toLowerCase();

    // Check text length - very short reviews are more likely to be human
    if (text.length < 20) {
      return 'human';
    }

    // Check for common AI patterns

    // 1. Overly formal language
    const formalPhrases = [
      'in conclusion',
      'to summarize',
      'it is worth noting',
      'it should be noted',
      'in my opinion',
      'i must say',
      'i would like to emphasize'
    ];

    let formalCount = 0;
    formalPhrases.forEach(phrase => {
      if (lowerText.includes(phrase)) {
        formalCount++;
      }
    });

    // 2. Repetitive structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.length / (sentences.length || 1);

    // Calculate variance in sentence lengths (low variance suggests AI)
    let sentenceLengthVariance = 0;
    if (sentences.length > 1) {
      const lengthSum = sentences.reduce((sum, s) => sum + s.length, 0);
      const meanLength = lengthSum / sentences.length;

      const squaredDiffs = sentences.map(s => Math.pow(s.length - meanLength, 2));
      const sumSquaredDiffs = squaredDiffs.reduce((sum, val) => sum + val, 0);

      sentenceLengthVariance = sumSquaredDiffs / sentences.length;
    }

    // 3. Check for personal pronouns (more common in human text)
    const personalPronouns = ['i', 'me', 'my', 'mine', 'myself'];
    let pronounCount = 0;

    personalPronouns.forEach(pronoun => {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        pronounCount += matches.length;
      }
    });

    // 4. Check for emotional language (more common in human text)
    const emotionalWords = [
      'love', 'hate', 'amazing', 'terrible', 'awesome', 'awful',
      'great', 'bad', 'worst', 'best', 'disappointed', 'excited'
    ];

    let emotionalCount = 0;
    emotionalWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        emotionalCount += matches.length;
      }
    });

    // Decision logic based on our simple heuristics
    // This is a very simplified approach for demo purposes

    // High formal language + low sentence variance + few personal pronouns = likely AI
    if (formalCount >= 2 && sentenceLengthVariance < 100 && pronounCount <= 1) {
      return 'AI';
    }

    // High emotional content + personal pronouns = likely human
    if (emotionalCount >= 2 || pronounCount >= 3) {
      return 'human';
    }

    // Very consistent sentence length suggests AI
    if (sentences.length >= 3 && sentenceLengthVariance < 50) {
      return 'AI';
    }

    // Default to human if no clear patterns are detected
    return 'human';
  }
}
