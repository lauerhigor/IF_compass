const mongoose = require('mongoose');

const ConsentSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  customerId: { type: String, ref: 'Customer', required: true },
  permissions: [{ type: String, required: true }],
  status: { type: String, required: true, enum: ['AUTHORIZED', 'REVOKED'], default: 'AUTHORIZED' },
  expirationDateTime: { type: Date, required: true },
  creationDateTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Consent', ConsentSchema);
