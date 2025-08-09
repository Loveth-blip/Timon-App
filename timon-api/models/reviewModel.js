import mongoose from "mongoose";
import validator from "validator";

const behavioralDataSchema = mongoose.Schema(
  {
    typingRhythm: {
      naturalPauses: {
        type: Number,
        default: 0,
        min: [0, "Natural pauses cannot be negative"],
      },
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
      min: [0, "Total time spent cannot be negative"],
    },
    typingSpeed: {
      average: {
        type: Number,
        default: 0,
        min: [0, "Average typing speed cannot be negative"],
      },
      variance: {
        type: Number,
        default: 0,
        min: [0, "Typing speed variance cannot be negative"],
      },
    },
    pausePatterns: {
      longPauses: {
        type: Number,
        default: 0,
        min: [0, "Long pauses cannot be negative"],
      },
    },
    editingPatterns: {
      corrections: {
        type: Number,
        default: 0,
        min: [0, "Corrections cannot be negative"],
      },
    },
  },
  { _id: false }
);

const tagsSchema = mongoose.Schema(
  {
    linguistic: {
      type: String,
      enum: ["Real", "Fake"],
      default: "Real",
    },
    behavioralScore: {
      type: Number,
      default: 0,
      min: [0, "Behavioral score cannot be negative"],
      max: [100, "Behavioral score cannot exceed 100"],
    },
    behavioralReasons: [
      {
        type: String,
        trim: true,
      },
    ],
    linguisticScore: {
      type: Number,
      default: 0,
      min: [0, "Linguistic score cannot be negative"],
      max: [1, "Linguistic score cannot exceed 1"],
    },
    behavioral: {
      type: String,
      enum: ["human", "suspicious"],
      default: "real",
    },
    analysisComplete: {
      type: Boolean,
      default: false,
    },
    finalDecision: {
      type: String,
      enum: ["real", "fake", "suspicious", "needs_review"],
      default: "needs_review",
    },
  },
  { _id: false }
);

const reviewSchema = mongoose.Schema(
  {
    reviewText: {
      type: String,
      required: [true, "Please provide a review text"],
      trim: true,
      minlength: [10, "Review text must be at least 10 characters long"],
      maxlength: [2000, "Review text cannot exceed 2000 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: function (value) {
          return Number.isInteger(value) && value >= 1 && value <= 5;
        },
        message: "Rating must be an integer between 1 and 5",
      },
    },
    userId: {
      type: String,
      required: [true, "Please provide a user ID"],
      trim: true,
    },
    productId: {
      type: String,
      required: [true, "Please provide a product ID"],
      trim: true,
    },
    behavioralData: {
      type: behavioralDataSchema,
      default: {},
    },
    behavioralDataRaw: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    tags: {
      type: tagsSchema,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, "Helpful count cannot be negative"],
    },
    reportCount: {
      type: Number,
      default: 0,
      min: [0, "Report count cannot be negative"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for review status
reviewSchema.virtual("status").get(function () {
  if (this.tags.finalDecision === "approved") return "approved";
  if (this.tags.finalDecision === "rejected") return "rejected";
  return "pending";
});

// Virtual for trust score
reviewSchema.virtual("trustScore").get(function () {
  const behavioralWeight = 0.4;
  const linguisticWeight = 0.6;

  const behavioralScore = this.tags.behavioralScore || 0;
  const linguisticScore = (this.tags.linguisticScore || 0) * 100;

  return Math.round(
    behavioralScore * behavioralWeight + linguisticScore * linguisticWeight
  );
});

// Indexes for better query performance
reviewSchema.index({ productId: 1, rating: 1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ "tags.finalDecision": 1 });
reviewSchema.index({ "tags.behavioral": 1 });

// Pre-save middleware to update the updatedAt field
reviewSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-find middleware to only show active reviews
reviewSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Instance method to mark review as helpful
reviewSchema.methods.markHelpful = function () {
  this.helpfulCount += 1;
  return this.save();
};

// Instance method to report review
reviewSchema.methods.report = function () {
  this.reportCount += 1;
  return this.save();
};

// Instance method to update analysis tags
reviewSchema.methods.updateAnalysis = function (analysisData) {
  this.tags = { ...this.tags, ...analysisData };
  this.tags.analysisComplete = true;
  return this.save();
};

// Static method to find reviews by product
reviewSchema.statics.findByProduct = function (productId, options = {}) {
  const query = { productId, isActive: true };

  if (options.rating) {
    query.rating = options.rating;
  }

  if (options.status) {
    query["tags.finalDecision"] = options.status;
  }

  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find reviews by user
reviewSchema.statics.findByUser = function (userId) {
  return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
};

// Static method to find suspicious reviews
reviewSchema.statics.findSuspicious = function () {
  return this.find({
    "tags.behavioral": "suspicious",
    isActive: true,
  }).sort({ createdAt: -1 });
};

// Static method to get average rating for a product
reviewSchema.statics.getAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { productId, isActive: true, "tags.finalDecision": "approved" } },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } },
    },
  ]);

  return result.length > 0
    ? { average: result[0].avgRating, count: result[0].count }
    : { average: 0, count: 0 };
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
