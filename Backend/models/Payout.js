const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Rejected'], default: 'Pending' },
  payoutMethod: { type: String, default: 'Bank Transfer' },
  payoutDetails: { type: Object }, // e.g., { bankName, accountNumber }
  adminNote: { type: String },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
});

module.exports = mongoose.model('Payout', payoutSchema);
