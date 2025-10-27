const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, required: true, enum: ['credit', 'debit'] },
  category: { type: String, required: true }
});

module.exports = mongoose.model('Transaction', TransactionSchema);