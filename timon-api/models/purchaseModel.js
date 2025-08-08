import mongoose from "mongoose";

const purchaseSchema = mongoose.Schema(
  {
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
    amount: {
      type: Number,
      required: [true, "Please provide a purchase amount"],
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Amount must be a positive number",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "cancelled", "refunded"],
        message: "Status must be one of: pending, completed, cancelled, refunded",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "Credit Card",
      trim: true,
    },
    shippingAddress: {
      street: {
        type: String,
        default: "123 Demo Street",
        trim: true,
      },
      city: {
        type: String,
        default: "Demo City",
        trim: true,
      },
      state: {
        type: String,
        default: "Demo State",
        trim: true,
      },
      zipCode: {
        type: String,
        default: "12345",
        trim: true,
      },
      country: {
        type: String,
        default: "Demo Country",
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for purchase date
purchaseSchema.virtual("purchaseDate").get(function () {
  return this.createdAt;
});

// Index for better query performance
purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ productId: 1 });
purchaseSchema.index({ status: 1 });

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
