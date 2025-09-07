const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema(
  {
    data: Buffer,
    contentType: String,
    filename: String,
    size: Number,
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },

    // your new storage layout
    image: { type: mongoose.Schema.Types.Mixed }, // can be ImageSchema object or string URL
    imageUrl: { type: String },    // served URL for FE


    price: { type: Number, required: true },
   // value: { type: Number }, // alias for price (keep if FE still sends value)
    demandValue: { type: Number, default: 0 }, // saved and updated dynamically
    owner: { type: String, required: true },
    daoId: { type: String, required: true, index: true }, // New field for DAO ID
    //isOwned: { type: Boolean, default: true },
    onMarket: { type: Boolean, default: false },
    personalItem: { type: Boolean, default: false },

    yearsOfUse: Number,
    authenticityCertificate: String,
    isMarketItem: Boolean,
    initialBid: Number, // initial bid amount for market items
    demandPrice: Number,
    isRentable: Boolean,

    bids: { type: [Number], default: [] },  },
  { timestamps: true }
);

ProductSchema.index({ owner: 1, createdAt: -1 });
ProductSchema.index({ daoId: 1 }); // Additional index for daoId

// Helper method to compute demand value from source of truth
ProductSchema.methods.computeDemandValue = function () {
  const base = (this.isMarketItem && this.initialBid) ? (this.price - this.initialBid) : this.price;
  const totalBids = Array.isArray(this.bids) ? this.bids.reduce((a, b) => a + b, 0) : 0;
  return Math.max(0, base - totalBids);
};

// Pre-save hook to automatically recalculate demandValue
ProductSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('initialBid') || this.isModified('bids') || this.demandValue == null) {
    this.demandValue = this.computeDemandValue();
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);