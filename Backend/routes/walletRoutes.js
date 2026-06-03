const express = require("express");
const router = express.Router();
const { getWalletDetails } = require("../controllers/walletController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/Roalbase.auth.Middleware");

router.get("/details", authMiddleware, authorize("seller"), getWalletDetails);

module.exports = router;
