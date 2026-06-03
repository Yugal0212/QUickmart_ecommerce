const Product = require("../models/Product");
const { uploadOnCloudinary } = require("../utils/cloudinary");


const createProduct = async (req, res) => {
  try {
    const { name, description, price, stockQuantity, category } = req.body;
    if (!name || !description || !price || !stockQuantity || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadOnCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      uploadedImages = results.filter(result => result !== null);
      
      if (uploadedImages.length === 0) {
         return res.status(500).json({ message: "Failed to upload images. Please try again." });
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      stockQuantity,
      category,
      seller: req.user._id, // Attach the seller's ID
      images: uploadedImages,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get All Products

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name") // Populate category name
      .populate("seller", "username"); 
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductsByseller = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate("category", "name") // Populate category name
      .populate("seller", "username"); // Populate seller name
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name").populate("seller", "username");
    res.json(product || { message: "Product not found" });
  } catch (error) {
    res.json({ message: "Server error" });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this product" });
    }

    let uploadedImages = product.images; // Keep old images by default
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadOnCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      const newImages = results.filter(result => result !== null);
      if (newImages.length > 0) {
        uploadedImages = newImages; // Replace old images with new ones
      }
    }

    const updateData = { ...req.body, images: uploadedImages };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "Product updated", product: updatedProduct });
  } 
  catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Quick Update Stock (Inventory Module)
const updateStock = async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    if (stockQuantity === undefined) {
      return res.status(400).json({ message: "Stock quantity is required" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this product's stock" });
    }

    product.stockQuantity = stockQuantity;
    await product.save();

    res.json({ message: "Stock updated successfully", product });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Allow sellers to delete their own products and admins to delete any product
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: "Server error" });
  }
};
const serchbyproducts = async (req, res) => {
  try {
    const { query } = req.query; // Get search query from URL parameters

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Perform a case-insensitive search for products matching the name or category
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Search by name
        { "category.name": { $regex: query, $options: "i" } }, // Search by category name
      ],
    })
      .populate("category", "name") // Populate category name
      .populate("seller", "username"); // Populate seller name

    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, updateStock, deleteProduct,getProductsByseller,serchbyproducts};

 