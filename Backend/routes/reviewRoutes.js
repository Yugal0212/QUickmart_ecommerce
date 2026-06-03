const express = require("express");
const router = express.Router();
const { createReview, getProductReviews, getSellerReviews, replyToReview } = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/Roalbase.auth.Middleware");

// Customer Routes
router.post("/create", authMiddleware, createReview);
router.get("/product/:productId", getProductReviews);

// Seller Routes
router.get("/seller", authMiddleware, authorize("seller"), getSellerReviews);
router.put("/seller/reply/:reviewId", authMiddleware, authorize("seller"), replyToReview);

module.exports = router;
