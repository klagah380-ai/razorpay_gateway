const shortid = require('shortid');
const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');

exports.showCheckout = (req, res) => {
  res.render('checkout', {
    key_id: process.env.RAZORPAY_KEY_ID,
    base_url: process.env.BASE_URL
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: shortid.generate(),
      payment_capture: 1
    };

    const response = await razorpayInstance.orders.create(options);

    const order = new Order({
      shortId: shortid.generate(),
      razorpay_order_id: response.id,
      amount: response.amount,
      currency: response.currency,
      status: 'created'
    });

    await order.save();

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating Razorpay order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await Order.findOneAndUpdate(
        { razorpay_order_id },
        { razorpay_payment_id, razorpay_signature, status: 'paid' }
      );
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};
