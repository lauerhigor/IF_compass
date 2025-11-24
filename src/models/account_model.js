const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true, enum: ['checking', 'savings'] },
  branch: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  balance: { type: Number, required: true, default: 0.00 },
  transactions: [{ type: String, ref: 'Transaction' }],
  customer: { type: String, ref: 'Customer', required: true }
});

module.exports = mongoose.model('Account', AccountSchema);