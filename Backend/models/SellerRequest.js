const mongoose = require("mongoose");

const sellerRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  
  storeName: { type: String, required: true },
  businessName: { type: String, required: true },
  gstNumber: { type: String, required: true },
  panNumber: { type: String, required: true },
  
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  
  bankDetails: {
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true }
  },
  
  documents: {
    aadhaarCard: { type: String }, // Cloudinary URL
    panCard: { type: String },
    gstCertificate: { type: String },
    businessLicense: { type: String }
  },
  
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  adminRemark: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  rejectedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("SellerRequest", sellerRequestSchema);
