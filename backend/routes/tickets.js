const router      = require('express').Router();
const Ticket      = require('../models/Ticket');
const Event       = require('../models/Event');
const Order       = require('../models/Order');
const Transaction = require('../models/Transaction');
const User        = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/tickets/event/:eventId — all available tickets for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ event: req.params.eventId, status: 'available' })
      .populate('seller', 'name')
      .sort({ price: 1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tickets/match/:eventId — best-priced tickets (dynamic matching, top 5)
router.get('/match/:eventId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ event: req.params.eventId, status: 'available' })
      .sort({ price: 1 })
      .limit(5)
      .populate('seller', 'name');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tickets/my — tickets owned by me
router.get('/my', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ currentOwner: req.user._id })
      .populate('event', 'title date venue category')
      .populate('seller', 'name');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tickets/list — list a ticket for sale (any user)
router.post('/list', protect, async (req, res) => {
  try {
    const { eventId, price, seatNumber, category } = req.body;
    if (!eventId || !price) return res.status(400).json({ message: 'eventId and price required' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ticket = await Ticket.create({
      event:        eventId,
      seller:       req.user._id,
      currentOwner: req.user._id,
      price:        Number(price),
      seatNumber:   seatNumber || 'Any',
      category:     category   || 'General',
    });

    await ticket.populate('event', 'title date venue');
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tickets/buy/:ticketId — buy a ticket (deducted from wallet)
router.post('/buy/:ticketId', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket || ticket.status !== 'available')
      return res.status(400).json({ message: 'Ticket is not available' });

    if (ticket.seller.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot buy your own ticket' });

    const buyer  = await User.findById(req.user._id);
    const seller = await User.findById(ticket.seller);

    if (buyer.walletBalance < ticket.price)
      return res.status(400).json({ message: 'Insufficient wallet balance. Please top up your wallet.' });

    // ── Atomic updates ───────────────────────────────────────────────
    ticket.status       = 'sold';
    ticket.currentOwner = req.user._id;
    await ticket.save();

    buyer.walletBalance  -= ticket.price;
    seller.walletBalance += ticket.price;
    await buyer.save();
    await seller.save();

    // ── Order record ─────────────────────────────────────────────────
    const order = await Order.create({
      buyer:  req.user._id,
      seller: ticket.seller,
      ticket: ticket._id,
      event:  ticket.event,
      amount: ticket.price,
      status: 'completed',
    });

    // ── Transaction records ──────────────────────────────────────────
    await Transaction.create({
      user:         req.user._id,
      type:         'debit',
      amount:       ticket.price,
      description:  `Purchased ticket #${ticket._id}`,
      relatedOrder: order._id,
      balanceAfter: buyer.walletBalance,
    });

    await Transaction.create({
      user:         ticket.seller,
      type:         'credit',
      amount:       ticket.price,
      description:  `Sold ticket #${ticket._id}`,
      relatedOrder: order._id,
      balanceAfter: seller.walletBalance,
    });

    res.json({
      message:        'Ticket purchased successfully!',
      order,
      walletBalance:  buyer.walletBalance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tickets/cancel/:ticketId — cancel a listing
router.patch('/cancel/:ticketId', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (ticket.status !== 'available')
      return res.status(400).json({ message: 'Only available listings can be cancelled' });

    ticket.status = 'cancelled';
    await ticket.save();
    res.json({ message: 'Listing cancelled', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
