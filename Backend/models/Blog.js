const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    featuredImage: { type: String },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: { type: String },
    },
  },
  { timestamps: true }
);

// Performance Indexes for SEO and Search
BlogSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Blog", BlogSchema);
