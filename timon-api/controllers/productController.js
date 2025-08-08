import Product from "../models/productModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";

// Create a single product
export const createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
});

// Create multiple products (for bulk import)
export const createMultipleProducts = catchAsync(async (req, res, next) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products)) {
    return next(new AppError("Please provide an array of products", 400));
  }

  // Validate each product before creating
  const validatedProducts = [];
  for (const product of products) {
    try {
      const newProduct = new Product(product);
      await newProduct.validate();
      validatedProducts.push(product);
    } catch (error) {
      return next(new AppError(`Invalid product data: ${error.message}`, 400));
    }
  }

  const createdProducts = await Product.insertMany(validatedProducts);

  res.status(201).json({
    status: "success",
    results: createdProducts.length,
    data: {
      products: createdProducts,
    },
  });
});

// Get all products
export const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

// Get a single product
export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Update a product
export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Delete a product
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
