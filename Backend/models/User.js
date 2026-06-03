const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "customer" },
    roles: { type: [String], default: ["customer"] },
    sellerStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    refreshToken: { type: String, default: null },
    sellerDetails: {
      storeName: { type: String, required: false },
      storeDescription: { type: String, required: false },
      contactNumber: { type: String, required: false },
      supportEmail: { type: String, required: false },
      storeAddress: { type: String, required: false },
      seo: {
        title: { type: String },
        description: { type: String },
        keywords: { type: String },
        slug: { type: String, unique: true },
      }
    },
    paymentDetails: {
      bankName: { type: String, required: false },
      accountNumber: { type: String, required: false },
      routingNumber: { type: String, required: false },
    },
    loginHistory: [
      {
        loginTime: { type: Date, default: Date.now },
        logoutTime: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

// Performance Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ sellerStatus: 1 });
UserSchema.index({ 'sellerDetails.storeName': 1 });

module.exports = mongoose.model("User", UserSchema);