const mongoose = require("mongoose");

const SellerApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storeName: { type: String, required: true },
    businessName: { type: String, required: true },
    phone: { type: String, required: true },
    gstNumber: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    storeLogo: { type: String }, // Cloudinary URL
    verificationDocuments: [{ type: String }],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerApplication", SellerApplicationSchema);
