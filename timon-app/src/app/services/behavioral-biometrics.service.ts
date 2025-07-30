import { Injectable } from '@angular/core';
import { BehavioralData } from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class BehavioralBiometricsService {
  private keyDownTimes: number[] = [];
  private keyUpTimes: number[] = [];
  private mouseMovements: number = 0;
  private backspaceCount: number = 0;
  private pasteCount: number = 0;
  private sessionStartTime: number = 0;
  private lastActivityTime: number = 0;
  private idleTimes: number[] = [];
  private isTracking: boolean = false;

  constructor() {}

  startTracking(): void {
    // Reset all tracking variables
    this.keyDownTimes = [];
    this.keyUpTimes = [];
    this.mouseMovements = 0;
    this.backspaceCount = 0;
    this.pasteCount = 0;
    this.idleTimes = [];
    this.sessionStartTime = Date.now();
    this.lastActivityTime = this.sessionStartTime;
    this.isTracking = true;

    // Add event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('paste', this.handlePaste);
  }

  stopTracking(): BehavioralData {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('paste', this.handlePaste);

    this.isTracking = false;

    // Calculate metrics
    const typingDuration = Date.now() - this.sessionStartTime;

    // Calculate average typing speed (time between keydowns)
    let totalKeyDownInterval = 0;
    let intervalCount = 0;

    for (let i = 1; i < this.keyDownTimes.length; i++) {
      const interval = this.keyDownTimes[i] - this.keyDownTimes[i - 1];
      // Only count reasonable intervals (less than 2 seconds)
      if (interval > 0 && interval < 2000) {
        totalKeyDownInterval += interval;
        intervalCount++;
      }
    }

    const typingSpeed =
      intervalCount > 0 ? totalKeyDownInterval / intervalCount : 0;

    // Return the behavioral data
    return {
      typingSpeed,
      typingDuration,
      backspaceCount: this.backspaceCount,
      pasteCount: this.pasteCount,
      mouseMovements: this.mouseMovements,
      idleTimes: this.idleTimes,
    };
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isTracking) return;

    const now = Date.now();
    this.keyDownTimes.push(now);

    // Check for idle time
    const idleTime = now - this.lastActivityTime;
    if (idleTime > 2000) {
      // If idle for more than 2 seconds
      this.idleTimes.push(idleTime);
    }

    this.lastActivityTime = now;

    // Track backspace usage
    if (event.key === 'Backspace') {
      this.backspaceCount++;
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    if (!this.isTracking) return;
    this.keyUpTimes.push(Date.now());
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.isTracking) return;
    this.mouseMovements++;
    this.lastActivityTime = Date.now();
  };

  private handlePaste = (event: Event): void => {
    if (!this.isTracking) return;
    this.pasteCount++;
    this.lastActivityTime = Date.now();
  };

  // Helper method to analyze the behavioral data and determine if it's suspicious
  analyzeBehavior(data: BehavioralData): 'real' | 'fake' {
    // Simple heuristic rules for behavioral analysis
    // These thresholds would need to be tuned based on real-world data

    // Very fast typing + no backspaces + pasting detected => Likely fake
    if (
      data.typingSpeed < 100 &&
      data.backspaceCount === 0 &&
      data.pasteCount > 0
    ) {
      return 'fake';
    }

    // Very consistent typing speed with no pauses => Likely fake
    if (data.idleTimes.length === 0 && data.typingDuration > 5000) {
      return 'fake';
    }

    // Natural typing speed + corrections + mouse movements => Likely real
    if (data.backspaceCount > 0 && data.mouseMovements > 10) {
      return 'real';
    }

    // Default to real if no suspicious patterns detected
    return 'real';
  }
}
