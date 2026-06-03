const Order = require("../models/Order");
const Product = require("../models/Product");
const Payout = require("../models/Payout");

// Get Seller Wallet Balance and Transaction History
exports.getWalletDetails = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    // Find all orders containing seller's products
    const orders = await Order.find({ "items.product": { $in: sellerProductIds } }).sort({ createdAt: -1 });

    let availableBalance = 0;
    let pendingClearance = 0;
    const transactions = [];

    orders.forEach(order => {
      let orderTotalForSeller = 0;
      
      order.items.forEach(item => {
        if (sellerProductIds.some(id => id.equals(item.product))) {
          const itemTotal = item.totalPrice || (item.price * item.quantity);
          orderTotalForSeller += itemTotal;
        }
      });

      if (orderTotalForSeller > 0) {
        if (order.orderStatus === "Delivered") {
          availableBalance += orderTotalForSeller;
        } else if (order.orderStatus === "Processing" || order.orderStatus === "Shipped" || order.orderStatus === "Pending") {
          pendingClearance += orderTotalForSeller;
        }

        transactions.push({
          orderId: order._id,
          amount: orderTotalForSeller,
          status: order.orderStatus === "Delivered" ? "Cleared" : (order.orderStatus === "Cancelled" || order.orderStatus === "Returned" ? "Cancelled" : "Pending"),
          date: order.createdAt
        });
      }
    });

    res.json({
      availableBalance,
      pendingClearance,
      totalEarned: availableBalance + pendingClearance,
      transactions
    });
  } catch (error) {
    console.error("Error fetching wallet details:", error);
    res.status(500).json({ error: error.message });
  }
};

// Request Payout (Seller)
exports.requestPayout = async (req, res) => {
  try {
    const { amount, payoutMethod, payoutDetails } = req.body;
    
    // In a real system, you would validate that availableBalance >= amount
    // Here we will just create the request
    
    const payout = new Payout({
      seller: req.user._id,
      amount,
      payoutMethod,
      payoutDetails
    });
    
    await payout.save();
    res.status(201).json({ message: "Payout requested successfully", payout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Payout Requests (Admin)
exports.getAllPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find().populate('seller', 'username email').sort({ requestedAt: -1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Process Payout (Admin)
exports.processPayout = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const payout = await Payout.findById(req.params.id);
    
    if (!payout) return res.status(404).json({ message: "Payout not found" });
    
    payout.status = status;
    payout.adminNote = adminNote;
    if (status === 'Completed' || status === 'Rejected') {
      payout.processedAt = Date.now();
    }
    
    await payout.save();
    res.json({ message: `Payout marked as ${status}`, payout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Admin Global Wallet Stats
exports.getGlobalWalletStats = async (req, res) => {
  try {
    const orders = await Order.find();
    let totalPlatformRevenue = 0; // Usually platform takes a cut (e.g., 10%)
    let totalSales = 0;
    
    orders.forEach(order => {
      if (order.orderStatus === "Delivered") {
        totalSales += order.totalAmount || 0;
      }
    });
    
    // Assume platform fee is 10%
    totalPlatformRevenue = totalSales * 0.10;
    
    const payouts = await Payout.find();
    let totalPaidOut = 0;
    let totalPendingPayouts = 0;
    
    payouts.forEach(p => {
      if (p.status === 'Completed') totalPaidOut += p.amount;
      if (p.status === 'Pending' || p.status === 'Processing') totalPendingPayouts += p.amount;
    });

    res.json({
      totalSales,
      totalPlatformRevenue,
      totalPaidOut,
      totalPendingPayouts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
