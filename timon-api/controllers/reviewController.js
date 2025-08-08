import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";

// Create a review
export const createReview = catchAsync(async (req, res, next) => {
  const { userId, productId, reviewText, behavioralDataRaw, behavioralData, rating } = req.body;

  // Validate required fields
  if (!userId || !productId || !reviewText || !rating) {
    return next(new AppError("Please provide userId, productId, reviewText, and rating", 400));
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Check if user has already reviewed this product
  const existingReview = await Review.findOne({ userId, productId, isActive: true });
  if (existingReview) {
    return next(new AppError("You have already reviewed this product", 400));
  }

  // Prepare review data
  const reviewData = {
    userId,
    productId,
    reviewText,
    rating,
    behavioralData: behavioralData || {},
    behavioralDataRaw: behavioralDataRaw || {}
  };

  // Create the review
  const newReview = await Review.create(reviewData);

  // Update product's average rating and review count
  const { average, count } = await Review.getAverageRating(productId);
  await Product.findByIdAndUpdate(productId, {
    rating: average,
    numReviews: count
  });

  res.status(201).json({
    status: "success",
    data: {
      review: newReview,
    },
  });
});

// Get all reviews
export const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find().populate('productId', 'title');

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Get reviews by product
export const getReviewsByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, status } = req.query;

  const options = {};
  if (rating) options.rating = parseInt(rating);
  if (status) options.status = status;

  const reviews = await Review.findByProduct(productId, options);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Get reviews by user
export const getReviewsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const reviews = await Review.findByUser(userId);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Get a single review
export const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

// Update a review
export const updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  // Update product's average rating if rating was changed
  if (req.body.rating) {
    const { average, count } = await Review.getAverageRating(review.productId);
    await Product.findByIdAndUpdate(review.productId, {
      rating: average,
      numReviews: count
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

// Delete a review
export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  // Update product's average rating and review count
  const { average, count } = await Review.getAverageRating(review.productId);
  await Product.findByIdAndUpdate(review.productId, {
    rating: average,
    numReviews: count
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Mark review as helpful
export const markReviewHelpful = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  await review.markHelpful();

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

// Report a review
export const reportReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  await review.report();

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

// Get suspicious reviews
export const getSuspiciousReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findSuspicious();

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Update review analysis
export const updateReviewAnalysis = catchAsync(async (req, res, next) => {
  const { analysisData } = req.body;
  
  if (!analysisData) {
    return next(new AppError("Please provide analysis data", 400));
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  await review.updateAnalysis(analysisData);

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});
