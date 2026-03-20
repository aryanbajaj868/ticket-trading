const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    event:  { type: mongoose.Schema.Types.ObjectId, ref: 'Event',  required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
