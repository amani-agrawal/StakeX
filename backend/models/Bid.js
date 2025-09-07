const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true }, // store product _id as string
  userId:    { type: String, required: true, index: true }, // bidder _id as string
  amount:    { type: Number, required: true, min: 0 },
  message:   { type: String },
  status:    { type: String, enum: ['pending','accepted','rejected'], default: 'pending', index: true },
}, { timestamps: true });

BidSchema.index({ productId: 1, createdAt: -1 });

module.exports = mongoose.model('Bid', BidSchema);