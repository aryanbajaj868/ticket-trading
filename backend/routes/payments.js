const router      = require('express').Router();
const Razorpay    = require('razorpay');
const crypto      = require('crypto');
const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order — create Razorpay order (amount in INR)
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1)
      return res.status(400).json({ message: 'Minimum top-up is ₹1' });

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  `topup_${req.user._id}_${Date.now()}`,
    });

    res.json({ orderId: order.id, amount, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/verify — verify signature and credit wallet
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    // Signature check
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSig = hmac.digest('hex');

    if (expectedSig !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed' });

    // Credit wallet
    const user          = await User.findById(req.user._id);
    user.walletBalance += Number(amount);
    await user.save();

    // Record transaction
    await Transaction.create({
      user:              req.user._id,
      type:              'wallet_topup',
      amount:            Number(amount),
      description:       'Wallet top-up via Razorpay',
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      balanceAfter:      user.walletBalance,
    });

    res.json({ message: 'Wallet credited!', walletBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

router.post('/test-topup', require('../middleware/auth').protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const Transaction = require('../models/Transaction');
    const { amount = 500 } = req.body;
    const user = await User.findById(req.user._id);
    user.walletBalance += Number(amount);
    await user.save();
    await Transaction.create({ user: req.user._id, type: 'wallet_topup', amount: Number(amount), description: '[TEST] Wallet top-up', balanceAfter: user.walletBalance });
    res.json({ message: 'Added', walletBalance: user.walletBalance });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
