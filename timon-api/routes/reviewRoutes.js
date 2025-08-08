import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByProduct,
  getReviewsByUser,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  reportReview,
  getSuspiciousReviews,
  updateReviewAnalysis,
} from "../controllers/reviewController.js";

const router = express.Router();

// Review routes
router.route("/").get(getAllReviews).post(createReview);
router.route("/suspicious").get(getSuspiciousReviews);
router.route("/product/:productId").get(getReviewsByProduct);
router.route("/user/:userId").get(getReviewsByUser);
router
  .route("/:id")
  .get(getReview)
  .patch(updateReview)
  .delete(deleteReview);
router.route("/:id/helpful").patch(markReviewHelpful);
router.route("/:id/report").patch(reportReview);
router.route("/:id/analysis").patch(updateReviewAnalysis);

export default router;
