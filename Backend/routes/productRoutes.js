const express = require("express");
const { upload } = require("../middleware/Multer.middleware");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/Roalbase.auth.Middleware"); // Import role-based middleware
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  getProductsByseller,
  serchbyproducts
} = require("../controllers/productController");

const router = express.Router();

// Create product (seller/admin only)
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("seller", "admin"),
  upload.array("images", 5),
  createProduct
);

// Public listing
router.get("/", getAllProducts);
// Seller products
router.get("/seller", authMiddleware, roleMiddleware("seller", "admin"), getProductsByseller);
// Search must be declared before routes with :id to avoid being captured as an ID
router.get("/search", authMiddleware, serchbyproducts);
// Specific product by id
router.get("/:id", getProductById);
router.put("/:id", authMiddleware, roleMiddleware("seller", "admin"), updateProduct);
router.patch("/stock/:id", authMiddleware, roleMiddleware("seller", "admin"), updateStock);
router.delete("/:id", authMiddleware, roleMiddleware("seller", "admin"), deleteProduct);

module.exports = router;
