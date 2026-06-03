const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'QuickMart' },
  supportEmail: { type: String, default: 'support@quickmart.com' },
  commissionRate: { type: Number, default: 10 },
  taxRate: { type: Number, default: 5 },
  enableRegistrations: { type: Boolean, default: true },
  enableSellerApplications: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  currency: { type: String, default: 'INR' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
