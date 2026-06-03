const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const SellerApplication = require("../models/SellerApplication");

// Get Admin Analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ roles: "customer" });
    const totalSellers = await User.countDocuments({ roles: "seller" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find();
    let totalRevenue = 0;
    orders.forEach(order => {
      totalRevenue += order.totalAmount;
    });

    res.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Users (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ roles: { $ne: "admin" } }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Block/Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.roles.includes("admin")) {
      return res.status(403).json({ message: "Cannot delete an admin" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all pending seller requests
const getSellerRequests = async (req, res) => {
  try {
    const requests = await SellerApplication.find({ status: "pending" }).populate("userId", "username email");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching seller requests." });
  }
};

// Approve a seller request
const approveSeller = async (req, res) => {
  try {
    const app = await SellerApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found." });
    
    if (app.status === "approved") return res.status(400).json({ message: "Already approved." });

    app.status = "approved";
    app.approvedAt = new Date();
    await app.save();

    // Update user roles and sellerStatus
    const user = await User.findById(app.userId);
    if (user) {
      if (!user.roles.includes("seller")) {
        user.roles.push("seller");
      }
      user.sellerStatus = "approved";
      await user.save();
    }

    res.json({ message: "Seller approved successfully.", application: app });
  } catch (error) {
    res.status(500).json({ message: "Server error approving seller." });
  }
};

// Reject a seller request
const rejectSeller = async (req, res) => {
  try {
    const { reason } = req.body;
    const app = await SellerApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found." });

    app.status = "rejected";
    app.rejectionReason = reason || "Does not meet requirements.";
    await app.save();

    await User.findByIdAndUpdate(app.userId, { sellerStatus: "rejected" });

    res.json({ message: "Seller rejected.", application: app });
  } catch (error) {
    res.status(500).json({ message: "Server error rejecting seller." });
  }
};

module.exports = {
  getAdminAnalytics,
  getAllUsers,
  deleteUser,
  getSellerRequests,
  approveSeller,
  rejectSeller
};
