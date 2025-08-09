import mongoose from "mongoose";
import validator from "validator";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a product title"],
      trim: true,
      maxlength: [100, "Product title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
      trim: true,
      maxlength: [
        500,
        "Product description cannot be more than 500 characters",
      ],
    },
    category: {
      type: String,
      required: [true, "Please provide a product category"],
      trim: true,
      enum: {
        values: [
          "Electronics",
          "Wearables",
          "Computers",
          "Accessories",
          "Clothing",
          "Books",
          "Home & Garden",
          "Sports",
          "Beauty",
          "Toys",
          "Automotive",
          "Health",
          "Other",
        ],
        message: "Category must be one of the predefined categories",
      },
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Price must be a positive number",
      },
    },
    imageUrl: {
      type: String,
      required: [true, "Please provide a product image URL"],
      validate: {
        validator: function (value) {
          return validator.isURL(value, { protocols: ["http", "https"] });
        },
        message: "Please provide a valid image URL",
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Stock must be a non-negative number",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: function (value) {
          return value >= 0 && value <= 5;
        },
        message: "Rating must be between 0 and 5",
      },
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Number of reviews cannot be negative"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    specifications: {
      type: Map,
      of: String,
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

// Virtual for average rating
productSchema.virtual("averageRating").get(function () {
  return this.numReviews > 0 ? (this.rating / this.numReviews).toFixed(1) : 0;
});

// Index for better query performance
productSchema.index({ category: 1, price: 1 });
productSchema.index({ title: "text", description: "text" });

// Pre-save middleware to update the updatedAt field
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-find middleware to only show active products
productSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Instance method to check if product is in stock
productSchema.methods.isInStock = function () {
  return this.stock > 0;
};

// Instance method to update stock
productSchema.methods.updateStock = function (quantity) {
  this.stock = Math.max(0, this.stock + quantity);
  return this.save();
};

// Static method to find products by category
productSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true });
};

// Static method to find products within price range
productSchema.statics.findByPriceRange = function (minPrice, maxPrice) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
    isActive: true,
  });
};

const Product = mongoose.model("Product", productSchema);

export default Product;
