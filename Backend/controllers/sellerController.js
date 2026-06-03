const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const SellerApplication = require("../models/SellerApplication");

// Apply to be a seller
const applyToBeSeller = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if already applied
    const existingApp = await SellerApplication.findOne({ userId });
    if (existingApp) {
      if (existingApp.status === "pending") {
        return res.status(400).json({ message: "Application already pending review." });
      } else if (existingApp.status === "approved") {
        return res.status(400).json({ message: "You are already an approved seller." });
      }
      // If rejected, allow re-apply? Yes, by updating the existing one or creating new.
      // We will allow updating if rejected.
    }

    const { storeName, businessName, phone, gstNumber, pickupAddress, storeLogo, verificationDocuments } = req.body;

    const newApp = new SellerApplication({
      userId,
      storeName,
      businessName,
      phone,
      gstNumber,
      pickupAddress,
      storeLogo,
      verificationDocuments,
      status: "pending"
    });

    await newApp.save();
    
    // Update user sellerStatus
    await User.findByIdAndUpdate(userId, { sellerStatus: "pending" });

    res.status(201).json({ message: "Application submitted successfully", application: newApp });
  } catch (error) {
    console.error("Error submitting seller application:", error);
    res.status(500).json({ message: "Server error during application." });
  }
};

// Get Application Status
const getApplicationStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const app = await SellerApplication.findOne({ userId }).sort({ createdAt: -1 });
    if (!app) {
      return res.status(404).json({ message: "No application found." });
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching status." });
  }
};

// Update Application (e.g. after rejection)
const updateApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const { storeName, businessName, phone, gstNumber, pickupAddress, storeLogo, verificationDocuments } = req.body;
    
    const app = await SellerApplication.findOne({ userId }).sort({ createdAt: -1 });
    if (!app) return res.status(404).json({ message: "Application not found." });

    if (app.status === 'approved') return res.status(400).json({ message: "Already approved." });

    app.storeName = storeName || app.storeName;
    app.businessName = businessName || app.businessName;
    app.phone = phone || app.phone;
    app.gstNumber = gstNumber || app.gstNumber;
    app.pickupAddress = pickupAddress || app.pickupAddress;
    if (storeLogo) app.storeLogo = storeLogo;
    if (verificationDocuments) app.verificationDocuments = verificationDocuments;
    
    app.status = "pending"; // Reset to pending
    app.rejectionReason = "";
    
    await app.save();
    await User.findByIdAndUpdate(userId, { sellerStatus: "pending" });

    res.json({ message: "Application updated successfully.", application: app });
  } catch (error) {
    res.status(500).json({ message: "Server error updating application." });
  }
};

// Get Seller Analytics
const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Product Stats
    const sellerProducts = await Product.find({ seller: sellerId });
    const sellerProductIds = sellerProducts.map(p => p._id);
    
    const totalProducts = sellerProducts.length;
    const lowStockProducts = sellerProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length;
    const outOfStockProducts = sellerProducts.filter(p => p.stockQuantity === 0).length;
    const activeProducts = totalProducts - outOfStockProducts;

    // Order Stats
    const orders = await Order.find({ "items.product": { $in: sellerProductIds } }).populate("user", "_id");
    const totalOrders = orders.length;
    
    let pendingOrders = 0;
    let processingOrders = 0;
    let deliveredOrders = 0;
    let returnedOrders = 0;
    let cancelledOrders = 0;
    
    let totalRevenue = 0;
    const uniqueCustomers = new Set();
    const monthlyRevenue = Array(12).fill(0); // 12 months
    
    orders.forEach(order => {
      // Order Status Counts
      if (order.orderStatus === 'Pending') pendingOrders++;
      else if (order.orderStatus === 'Processing') processingOrders++;
      else if (order.orderStatus === 'Delivered') deliveredOrders++;
      else if (order.orderStatus === 'Returned') returnedOrders++;
      else if (order.orderStatus === 'Cancelled') cancelledOrders++;

      // Customers
      if (order.user) uniqueCustomers.add(order.user._id.toString());
      
      // Revenue & Monthly Chart
      const orderMonth = new Date(order.createdAt).getMonth(); // 0-11
      
      order.items.forEach(item => {
        if (sellerProductIds.some(id => id.equals(item.product))) {
          const itemRevenue = item.totalPrice || (item.price * item.quantity);
          if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Returned') {
            totalRevenue += itemRevenue;
            monthlyRevenue[orderMonth] += itemRevenue;
          }
        }
      });
    });

    res.json({
      totalProducts, activeProducts, lowStockProducts, outOfStockProducts,
      totalOrders, pendingOrders, processingOrders, deliveredOrders, returnedOrders, cancelledOrders,
      totalRevenue,
      totalCustomers: uniqueCustomers.size,
      monthlyRevenue
    });
  } catch (error) {
    console.error("Error fetching seller analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Orders for Seller
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    const orders = await Order.find({ "items.product": { $in: sellerProductIds } })
      .populate("user", "username email")
      .populate("items.product", "name images price");

    // Filter items to only show seller's items
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => 
        item.product && sellerProductIds.some(id => id.equals(item.product._id))
      );
      return orderObj;
    });

    res.json(filteredOrders);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Customers for Seller
const getSellerCustomers = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id);

    // Find all orders containing seller's products
    const orders = await Order.find({ "items.product": { $in: sellerProductIds } })
      .populate("user", "username email avatar createdAt");

    // Aggregate unique customers and calculate their total spend/orders
    const customerMap = new Map();

    orders.forEach(order => {
      if (!order.user) return; // Skip if user was deleted
      
      const userId = order.user._id.toString();
      
      // Calculate how much this customer spent ONLY on THIS seller's items in this order
      let spendInOrder = 0;
      order.items.forEach(item => {
        if (sellerProductIds.some(id => id.equals(item.product))) {
           spendInOrder += item.totalPrice || (item.price * item.quantity);
        }
      });

      if (customerMap.has(userId)) {
        const existing = customerMap.get(userId);
        existing.totalOrders += 1;
        existing.totalSpent += spendInOrder;
      } else {
        customerMap.set(userId, {
          _id: order.user._id,
          username: order.user.username,
          email: order.user.email,
          joined: order.user.createdAt,
          totalOrders: 1,
          totalSpent: spendInOrder
        });
      }
    });

    res.json(Array.from(customerMap.values()));
  } catch (error) {
    console.error("Error fetching seller customers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Seller Profile Settings
const getSellerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('username email sellerDetails paymentDetails');
    if (!user) return res.status(404).json({ message: "Seller not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update Seller Profile Settings
const updateSellerProfile = async (req, res) => {
  try {
    const { storeName, storeDescription, supportEmail, contactNumber } = req.body;
    
    const updateData = {};
    if (storeName) updateData['sellerDetails.storeName'] = storeName;
    if (storeDescription) updateData['sellerDetails.storeDescription'] = storeDescription;
    if (supportEmail) updateData['sellerDetails.supportEmail'] = supportEmail;
    if (contactNumber) updateData['sellerDetails.contactNumber'] = contactNumber;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('sellerDetails');

    res.json({ message: "Profile updated successfully", sellerDetails: user.sellerDetails });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update Seller Payment Settings
const updateSellerPayment = async (req, res) => {
  try {
    const { bankName, accountNumber, routingNumber } = req.body;
    
    const updateData = {};
    if (bankName !== undefined) updateData['paymentDetails.bankName'] = bankName;
    if (accountNumber !== undefined) updateData['paymentDetails.accountNumber'] = accountNumber;
    if (routingNumber !== undefined) updateData['paymentDetails.routingNumber'] = routingNumber;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('paymentDetails');

    res.json({ message: "Payment details updated successfully", paymentDetails: user.paymentDetails });
  } catch (error) {
    console.error("Error updating payment details:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSellerAnalytics,
  getSellerOrders,
  getSellerCustomers,
  applyToBeSeller,
  getApplicationStatus,
  updateApplication,
  getSellerProfile,
  updateSellerProfile,
  updateSellerPayment
};
