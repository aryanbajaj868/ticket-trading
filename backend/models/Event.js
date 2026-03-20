const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String },
    venue:        { type: String, required: true },
    date:         { type: Date, required: true },
    totalTickets: { type: Number, required: true, min: 1 },
    basePrice:    { type: Number, required: true, min: 0 },
    category:     {
      type: String,
      enum: ['Concert', 'Sports', 'Theatre', 'Conference', 'Festival', 'Other'],
      default: 'Other',
    },
    image:        { type: String },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
