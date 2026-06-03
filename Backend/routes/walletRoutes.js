const express = require("express");
const router = express.Router();
const { 
  getWalletDetails, 
  requestPayout, 
  getAllPayouts, 
  processPayout, 
  getGlobalWalletStats 
} = require("../controllers/walletController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/Roalbase.auth.Middleware");

// Seller Routes
router.get("/details", authMiddleware, authorize("seller"), getWalletDetails);
router.post("/payout", authMiddleware, authorize("seller"), requestPayout);

// Admin Routes
router.get("/admin/stats", authMiddleware, authorize("admin"), getGlobalWalletStats);
router.get("/admin/payouts", authMiddleware, authorize("admin"), getAllPayouts);
router.put("/admin/payouts/:id", authMiddleware, authorize("admin"), processPayout);

module.exports = router;
