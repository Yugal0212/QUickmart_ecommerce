const SellerRequest = require("../models/SellerRequest");
const User = require("../models/User");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const {
  sendAdminNewSellerEmail,
  sendSellerApprovedEmail,
  sendSellerRejectedEmail
} = require("../utils/sellerEmailService");

const applyToBeSeller = async (req, res) => {
  try {
    const {
      fullName, email, mobile, storeName, businessName, gstNumber, panNumber,
      address, city, state, pincode,
      accountHolderName, bankName, accountNumber, ifscCode
    } = req.body;

    // Check if user already has a pending or approved request
    const existing = await SellerRequest.findOne({ userId: req.user.id, status: { $ne: 'rejected' } });
    if (existing) {
      return res.status(400).json({ message: "You already have a pending or approved application." });
    }

    // Upload documents to Cloudinary if they exist
    const docs = {
      aadhaarCard: null,
      panCard: null,
      gstCertificate: null,
      businessLicense: null
    };

    if (req.files) {
      if (req.files.aadhaarCard) docs.aadhaarCard = await uploadOnCloudinary(req.files.aadhaarCard[0].buffer);
      if (req.files.panCard) docs.panCard = await uploadOnCloudinary(req.files.panCard[0].buffer);
      if (req.files.gstCertificate) docs.gstCertificate = await uploadOnCloudinary(req.files.gstCertificate[0].buffer);
      if (req.files.businessLicense) docs.businessLicense = await uploadOnCloudinary(req.files.businessLicense[0].buffer);
    }

    const newRequest = new SellerRequest({
      userId: req.user.id,
      fullName, email, mobile, storeName, businessName, gstNumber, panNumber,
      address, city, state, pincode,
      bankDetails: { accountHolderName, bankName, accountNumber, ifscCode },
      documents: docs
    });

    await newRequest.save();

    // Send email to admin
    await sendAdminNewSellerEmail(newRequest);

    res.status(201).json({ message: "Seller application submitted successfully", request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error submitting application." });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getApprovedRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getRejectedRequests = async (req, res) => {
  try {
    const requests = await SellerRequest.find({ status: 'rejected' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = await SellerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const approveRequest = async (req, res) => {
  try {
    const request = await SellerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = 'approved';
    request.approvedBy = req.user.id;
    request.approvedAt = new Date();
    await request.save();

    // Update User Role to seller
    await User.findByIdAndUpdate(request.userId, { roles: 'seller' });

    // Send email to seller
    await sendSellerApprovedEmail(request.email);

    res.json({ message: "Seller approved successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { adminRemark } = req.body;
    const request = await SellerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = 'rejected';
    request.adminRemark = adminRemark;
    request.rejectedAt = new Date();
    await request.save();

    // Send email to seller
    await sendSellerRejectedEmail(request.email, adminRemark);

    res.json({ message: "Seller rejected successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getMyApplicationStatus = async (req, res) => {
  try {
    const request = await SellerRequest.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!request) return res.status(404).json({ message: "No application found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  applyToBeSeller,
  getAllRequests,
  getPendingRequests,
  getApprovedRequests,
  getRejectedRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  getMyApplicationStatus
};
