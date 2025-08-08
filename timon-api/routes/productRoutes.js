import express from "express";
import {
  createProduct,
  createMultipleProducts,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Product routes
router.route("/").get(getAllProducts).post(createProduct);
router.route("/bulk").post(createMultipleProducts);
router
  .route("/:id")
  .get(getProduct)
  .patch(updateProduct)
  .delete(deleteProduct);

export default router;
