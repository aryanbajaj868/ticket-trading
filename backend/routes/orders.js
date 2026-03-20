const router      = require('express').Router();
const Order       = require('../models/Order');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// GET /api/orders/my — all buy and sell orders for current user
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .populate('ticket', 'price seatNumber category status')
      .populate('event',  'title date venue')
      .populate('buyer',  'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/transactions — wallet transaction history
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
