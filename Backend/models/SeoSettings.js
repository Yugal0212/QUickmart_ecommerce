const mongoose = require("mongoose");

const SeoSettingsSchema = new mongoose.Schema(
  {
    title: { type: String, default: "QickmartNexa - The Best E-Commerce Platform" },
    description: { type: String, default: "Shop online for electronics, fashion, and more." },
    keywords: { type: String, default: "ecommerce, shopping, online store" },
    author: { type: String, default: "QickmartNexa" },
    language: { type: String, default: "en" },
    canonicalUrl: { type: String, default: "https://quickmartnexa.vercel.app" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    googleSearchConsoleId: { type: String, default: "" },
    googleAnalyticsId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeoSettings", SeoSettingsSchema);
