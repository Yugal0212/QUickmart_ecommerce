const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  link: { type: String }, // Where the banner clicks to
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }, // For manual reordering
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Banner', bannerSchema);
