const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: String,
  amount: Number,
  currency: String,
  receipt: String,
  status: String
});

module.exports = mongoose.model('Order', orderSchema);
