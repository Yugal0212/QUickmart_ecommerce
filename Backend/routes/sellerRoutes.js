const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/Roalbase.auth.Middleware");
const {
  getSellerAnalytics,
  getSellerOrders,
  getSellerCustomers,
  getSellerProfile,
  updateSellerProfile,
  updateSellerPayment
} = require("../controllers/sellerController");
const { applyToBeSeller, getMyApplicationStatus } = require("../controllers/sellerRequestController");
const multer = require("multer");
const upload = multer();

const router = express.Router();

// Seller Routes (Must be seller)
// Seller Routes (Must be seller)
router.get("/analytics", authMiddleware, roleMiddleware("seller"), getSellerAnalytics);
router.get("/orders", authMiddleware, roleMiddleware("seller"), getSellerOrders);
router.get("/customers", authMiddleware, roleMiddleware("seller"), getSellerCustomers);
router.get("/dashboard", authMiddleware, roleMiddleware("seller"), getSellerAnalytics); // Alias for analytics if requested
router.get("/profile", authMiddleware, roleMiddleware("seller"), getSellerProfile);
router.put("/profile", authMiddleware, roleMiddleware("seller"), updateSellerProfile);
router.put("/payment", authMiddleware, roleMiddleware("seller"), updateSellerPayment);

// Application Routes (Can be customer)
router.post("/apply", authMiddleware, upload.fields([
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 }
]), applyToBeSeller);
router.get("/application-status", authMiddleware, getMyApplicationStatus);

module.exports = router;
