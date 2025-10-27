    const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  accounts: [{ type: String, ref: 'Account' }]
});

module.exports = mongoose.model('Customer', CustomerSchema);