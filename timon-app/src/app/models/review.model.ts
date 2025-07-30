export interface Review {
  id?: string;
  userId: string;
  productId: string;
  reviewText: string;
  createdAtDisplay?: Date;
  createdAt?: {
    nanoseconds: number;
    seconds: number;
  };
  tags: ReviewTags;
  rating?: number; // Optional rating for the review
  behavioralData?: BehavioralDataProcessed;
}

export interface ReviewTags {
  behavioral: 'real' | 'fake' | 'pending';
  linguistic: 'AI' | 'human' | 'pending';
  finalDecision: 'flagged' | 'real' | 'fake' | 'confirmed' | 'pending';
}

export interface BehavioralData {
  typingSpeed: number; // Average time between keydowns in ms
  typingDuration: number; // Total typing session duration in ms
  backspaceCount: number; // Number of backspace key presses
  pasteCount: number; // Number of paste operations
  mouseMovements: number; // Number of mouse movements during typing
  idleTimes: number[]; // Array of idle times in ms
}

export interface BehavioralDataProcessed {
  typingSpeed: {
    average: number;
    variance?: number;
  }; // Average time between keydowns in ms
  typingRhythm: {
    naturalPauses: number; // Number of natural pauses in ms
  };
  pausePatterns: {
    longPauses: number; // Number of long pauses in ms
  };
  editingPatterns: {
    corrections: number; // Number of corrections made (e.g., backspaces)
  };
  totalTimeSpent: number; // Total time spent typing in seconds,
}

export interface ReviewData {
  userId: string;
  productId: string;
  reviewText: string;
  behavioralDataRaw: BehavioralData; // Raw behavioral data from the client
  behavioralData: BehavioralDataProcessed;
  rating?: number; // Optional rating for the review
}

// export interface ReviewResponse {
//   reviewId: string;
//   behavioralTag: 'real' | 'fake';
//   linguisticTag: 'AI' | 'human';
//   finalDecision: 'flagged' | 'real' | 'fake' | 'confirmed';
// }
