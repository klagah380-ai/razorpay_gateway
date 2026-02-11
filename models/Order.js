import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  shortId: String,
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'created' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
