const Coupon = require('../models/Coupon');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Admin
exports.createCoupon = async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue,
      minPurchaseAmount, maxDiscountAmount, startDate, endDate, usageLimit
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = new Coupon({
      code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      createdBy: req.user ? req.user.id : null
    });

    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: "Server error creating coupon", error: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).populate('createdBy', 'username');
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching coupons" });
  }
};

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Admin
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    // Update fields
    Object.keys(req.body).forEach((key) => {
      coupon[key] = req.body[key];
    });
    coupon.updatedAt = Date.now();

    await coupon.save();
    res.json({ message: "Coupon updated successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: "Server error updating coupon" });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting coupon" });
  }
};

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Public / Authenticated
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "This coupon is no longer active" });
    }

    const now = new Date();
    if (now < coupon.startDate) {
      return res.status(400).json({ message: "This coupon is not active yet" });
    }

    if (now > coupon.endDate) {
      return res.status(400).json({ message: "This coupon has expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "This coupon usage limit has been reached" });
    }

    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum purchase amount for this coupon is $${coupon.minPurchaseAmount}` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount isn't more than cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    res.json({
      message: "Coupon applied successfully",
      couponId: coupon._id,
      code: coupon.code,
      discountAmount: discountAmount,
      finalTotal: cartTotal - discountAmount
    });

  } catch (error) {
    res.status(500).json({ message: "Server error validating coupon" });
  }
};
