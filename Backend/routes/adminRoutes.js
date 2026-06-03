const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/Roalbase.auth.Middleware");
const {
  getAdminAnalytics,
  getAllUsers,
  deleteUser,
  blockUser,
  unblockUser,
  getSellerRequests,
  getApprovedSellers,
  getGlobalProducts,
  approveProduct,
  rejectProduct,
  getGlobalOrders,
  approveSeller,
  rejectSeller,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getSystemSettings,
  updateSystemSettings,
  createCampaign,
  getAiInsights,
  getAuditLogs
} = require("../controllers/adminController");
const {
  getAllRequests,
  getPendingRequests,
  getApprovedRequests,
  getRejectedRequests,
  getRequestById,
  approveRequest,
  rejectRequest
} = require("../controllers/sellerRequestController");

const router = express.Router();

// Admin Routes
router.get("/analytics", authMiddleware, roleMiddleware("admin"), getAdminAnalytics);
router.get("/users", authMiddleware, roleMiddleware("admin"), getAllUsers);
router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), deleteUser);
router.put("/users/:id/block", authMiddleware, roleMiddleware("admin"), blockUser);
router.put("/users/:id/unblock", authMiddleware, roleMiddleware("admin"), unblockUser);

// Seller Requests Routes (V2)
router.get("/seller-request/pending", authMiddleware, roleMiddleware("admin"), getPendingRequests);
router.get("/seller-request/approved", authMiddleware, roleMiddleware("admin"), getApprovedRequests);
router.get("/seller-request/rejected", authMiddleware, roleMiddleware("admin"), getRejectedRequests);
router.get("/seller-requests", authMiddleware, roleMiddleware("admin"), getAllRequests);
router.get("/seller-request/:id", authMiddleware, roleMiddleware("admin"), getRequestById);
router.put("/seller-request/approve/:id", authMiddleware, roleMiddleware("admin"), approveRequest);
router.put("/seller-request/reject/:id", authMiddleware, roleMiddleware("admin"), rejectRequest);

// Old Legacy endpoints just in case they are still hit by old components temporarily
router.get("/approved-sellers", authMiddleware, roleMiddleware("admin"), getApprovedRequests);
router.put("/approve-seller/:id", authMiddleware, roleMiddleware("admin"), approveRequest);
router.put("/reject-seller/:id", authMiddleware, roleMiddleware("admin"), rejectRequest);

// Product Management Routes
router.get("/products", authMiddleware, roleMiddleware("admin"), getGlobalProducts);
router.put("/approve-product/:id", authMiddleware, roleMiddleware("admin"), approveProduct);
router.put("/reject-product/:id", authMiddleware, roleMiddleware("admin"), rejectProduct);

// Global Orders Routes
router.get("/orders", authMiddleware, roleMiddleware("admin"), getGlobalOrders);

// Banner Routes
router.get("/banners", getBanners); // Public so frontend can fetch them
router.post("/banners", authMiddleware, roleMiddleware("admin"), createBanner);
router.put("/banners/:id", authMiddleware, roleMiddleware("admin"), updateBanner);
router.delete("/banners/:id", authMiddleware, roleMiddleware("admin"), deleteBanner);

// System Settings Routes
router.get("/settings", authMiddleware, roleMiddleware("admin"), getSystemSettings);
router.put("/settings", authMiddleware, roleMiddleware("admin"), updateSystemSettings);

// Campaigns
router.post("/campaigns", authMiddleware, roleMiddleware("admin"), createCampaign);

// AI Insights
router.get("/ai-insights", authMiddleware, roleMiddleware("admin"), getAiInsights);

// Audit Logs
router.get("/audit-logs", authMiddleware, roleMiddleware("admin"), getAuditLogs);

module.exports = router;
