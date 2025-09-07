const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  images: [String],
  price: { type: Number, required: true }, // required for all items
  value: { type: Number },                 // alias for price (frontend compatibility)
  owner: { type: String, required: true }, // store user _id as string for easy === in FE
  isOwned: { type: Boolean, default: true },
  isBid: { type: Boolean, default: false },
  onMarket: { type: Boolean, default: false },
  personalItem: { type: Boolean, default: false }, // alias for onMarket
  yearsOfUse: Number,
  authenticityCertificate: String,
  isMarketItem: Boolean,
  demandPrice: Number,
  isRentable: Boolean,
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }], // reference to bids
}, { timestamps: true });

ProductSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);