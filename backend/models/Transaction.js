const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:             { type: String, enum: ['credit', 'debit', 'wallet_topup', 'refund'], required: true },
    amount:           { type: Number, required: true },
    description:      { type: String },
    balanceAfter:     { type: Number },
    razorpayOrderId:  { type: String },
    razorpayPaymentId:{ type: String },
    relatedOrder:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
