const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/Roalbase.auth.Middleware");
const {
  getAdminAnalytics,
  getAllUsers,
  deleteUser,
  getSellerRequests,
  approveSeller,
  rejectSeller
} = require("../controllers/adminController");

const router = express.Router();

// Admin Routes
router.get("/analytics", authMiddleware, roleMiddleware("admin"), getAdminAnalytics);
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

// Seller Requests Routes
router.get("/seller-requests", authMiddleware, roleMiddleware("admin"), getSellerRequests);
router.put("/approve-seller/:id", authMiddleware, roleMiddleware("admin"), approveSeller);
router.put("/reject-seller/:id", authMiddleware, roleMiddleware("admin"), rejectSeller);

module.exports = router;
