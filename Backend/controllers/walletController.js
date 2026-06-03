const Order = require("../models/Order");
const Product = require("../models/Product");

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
