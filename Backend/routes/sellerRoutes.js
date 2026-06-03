const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/Roalbase.auth.Middleware");
const {
  getSellerAnalytics,
  getSellerOrders,
  getSellerCustomers,
  applyToBeSeller,
  getApplicationStatus,
  updateApplication,
  getSellerProfile,
  updateSellerProfile,
  updateSellerPayment
} = require("../controllers/sellerController");

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
router.post("/apply", authMiddleware, applyToBeSeller);
router.get("/application-status", authMiddleware, getApplicationStatus);
router.put("/update-application", authMiddleware, updateApplication);

module.exports = router;
