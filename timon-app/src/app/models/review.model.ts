export interface Review {
  _id?: string;
  id?: string;
  userId: string;
  productId: string;
  reviewText: string;
  rating: number;
  behavioralData?: BehavioralDataProcessed;
  behavioralDataRaw?: BehavioralData;
  tags?: ReviewTags;
  isActive?: boolean;
  isVerified?: boolean;
  helpfulCount?: number;
  reportCount?: number;
  status?: string;
  trustScore?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdAtDisplay?: Date;
}

export interface ReviewTags {
  behavioral?: 'human' | 'suspicious' | 'pending';
  linguistic?: 'Real' | 'Fake' | 'pending';
  finalDecision?: 'real' | 'fake' | 'suspicious' | 'needs_review' | 'pending';
  behavioralScore?: number;
  behavioralReasons?: string[];
  linguisticScore?: number;
  analysisComplete?: boolean;
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
  behavioralDataRaw?: BehavioralData; // Raw behavioral data from the client
  behavioralData?: BehavioralDataProcessed;
  rating: number; // Required rating for the review
}
