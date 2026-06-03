// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  image:{ type: String, required: true }, 
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: { type: String },
    slug: { type: String, unique: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Category', categorySchema);
