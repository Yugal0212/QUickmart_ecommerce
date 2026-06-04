const Review = require("../models/Review");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Create a Review (Customer)
exports.createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = new Review({
      product,
      user: req.user._id,
      rating,
      comment,
    });

    await review.save();

    // Recalculate average rating and review count for the product
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(product) } },
      { $group: { _id: '$product', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(product, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount
      });
    }

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Reviews for a Product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "username")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Seller's Reviews (Seller)
exports.getSellerReviews = async (req, res) => {
  try {
    // Find all products owned by seller
    const sellerProducts = await Product.find({ seller: req.user._id }).select("_id");
    const productIds = sellerProducts.map((p) => p._id);

    // Find reviews for those products
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate("user", "username email")
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reply to Review (Seller)
exports.replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.reviewId).populate("product");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Verify seller owns the product
    if (review.product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to reply to this review" });
    }

    review.sellerReply = reply;
    await review.save();

    res.json({ message: "Reply added successfully", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
