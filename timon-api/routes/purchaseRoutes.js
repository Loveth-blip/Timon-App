import express from "express";
import {
  createPurchase,
  getUserPurchases,
  getAllPurchases,
  getPurchase,
  updatePurchase,
  deletePurchase,
  getPurchaseWithProduct,
  getUserPurchasesWithProducts,
} from "../controllers/purchaseController.js";

const router = express.Router();

// Purchase routes
router.route("/").get(getAllPurchases).post(createPurchase);
router.route("/user/:userId").get(getUserPurchases);
router.route("/user/:userId/with-products").get(getUserPurchasesWithProducts);
router
  .route("/:id")
  .get(getPurchase)
  .patch(updatePurchase)
  .delete(deletePurchase);
router.route("/:id/with-product").get(getPurchaseWithProduct);

export default router;
