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
module.exports = mongoose.model('Product', ProductSchema);