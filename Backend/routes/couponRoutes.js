const express = require('express');
const router = express.Router();
const { 
  createCoupon, 
  getAllCoupons, 
  updateCoupon, 
  deleteCoupon,
  validateCoupon
} = require('../controllers/couponController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/Roalbase.auth.Middleware');

// Public/User Routes
router.post('/validate', validateCoupon);

// Admin Routes
router.post('/', authMiddleware, authorize('admin'), createCoupon);
router.get('/', authMiddleware, authorize('admin'), getAllCoupons);
router.put('/:id', authMiddleware, authorize('admin'), updateCoupon);
router.delete('/:id', authMiddleware, authorize('admin'), deleteCoupon);

module.exports = router;
