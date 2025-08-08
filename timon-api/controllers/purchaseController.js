import Purchase from "../models/purchaseModel.js";
import Product from "../models/productModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";

// Create a new purchase
export const createPurchase = catchAsync(async (req, res, next) => {
  const { userId, productId, amount, paymentMethod, shippingAddress } = req.body;

  // Validate that the product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Create the purchase with default values for optional fields
  const purchaseData = {
    userId,
    productId,
    amount,
    paymentMethod: paymentMethod || 'Credit Card',
    shippingAddress: shippingAddress || {
      street: '123 Demo Street',
      city: 'Demo City',
      state: 'Demo State',
      zipCode: '12345',
      country: 'Demo Country'
    },
    status: "completed", // For demo purposes, set as completed
  };

  const newPurchase = await Purchase.create(purchaseData);

  res.status(201).json({
    status: "success",
    data: {
      purchase: newPurchase,
    },
  });
});

// Get all purchases for a user
export const getUserPurchases = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const purchases = await Purchase.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: purchases.length,
    data: {
      purchases,
    },
  });
});

// Get all purchases (admin only)
export const getAllPurchases = catchAsync(async (req, res, next) => {
  const purchases = await Purchase.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: purchases.length,
    data: {
      purchases,
    },
  });
});

// Get a single purchase
export const getPurchase = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Update a purchase
export const updatePurchase = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!purchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});

// Delete a purchase
export const deletePurchase = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findByIdAndDelete(req.params.id);

  if (!purchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get purchase with product details
export const getPurchaseWithProduct = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  // Get the associated product
  const product = await Product.findById(purchase.productId);

  if (!product) {
    return next(new AppError("Associated product not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
      product,
    },
  });
});

// Get user purchases with product details
export const getUserPurchasesWithProducts = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const purchases = await Purchase.find({ userId }).sort({ createdAt: -1 });

  // Get product details for each purchase
  const purchasesWithProducts = await Promise.all(
    purchases.map(async (purchase) => {
      const product = await Product.findById(purchase.productId);
      return {
        ...purchase.toObject(),
        product: product || null,
      };
    })
  );

  res.status(200).json({
    status: "success",
    results: purchasesWithProducts.length,
    data: {
      purchases: purchasesWithProducts,
    },
  });
});
