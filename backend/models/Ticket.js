const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    event:        { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    seller:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    currentOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
    price:        { type: Number, required: true, min: 0 },
    seatNumber:   { type: String, default: 'Any' },
    category:     { type: String, enum: ['VIP', 'Premium', 'General'], default: 'General' },
    status:       {
      type: String,
      enum: ['available', 'sold', 'cancelled'],
      default: 'available',
    },
  },
  { timestamps: true }
);

// Index for fast lookup of available tickets sorted by price (dynamic matching)
ticketSchema.index({ event: 1, status: 1, price: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
