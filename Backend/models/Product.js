const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, 
  images: [String],  // Cloudinary image URLs
  stockQuantity: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  rejectionReason: { type: String },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: { type: String },
    slug: { type: String, unique: true },
    canonicalUrl: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Performance Indexes
productSchema.index({ name: 'text', description: 'text' }); // Text search indexing
productSchema.index({ category: 1, approvalStatus: 1 }); // Category and status lookups
productSchema.index({ seller: 1, approvalStatus: 1 }); // Seller dashboard lookups
productSchema.index({ price: 1 }); // Sorting by price

module.exports = mongoose.model('Product', productSchema);
