const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Bid = require('../models/Bid');

const router = express.Router();

// Authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = payload; // { id, email }
    next();
  });
};

// GET /api/bids (list with optional filters: productId, userId, status)
router.get('/', async (req, res) => {
  try {
    const { productId, userId, status } = req.query;
    const q = {};
    if (productId) q.productId = String(productId);
    if (userId)    q.userId    = String(userId);
    if (status)    q.status    = String(status);
    const bids = await Bid.find(q).sort({ createdAt: -1 });
    res.json({ success: true, data: bids });
  } catch (e) { 
    res.status(500).json({ success: false, message: e.message }); 
  }
});

// POST /api/bids (auth)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { productId, amount, message } = req.body;
    if (!productId || amount == null) {
      return res.status(400).json({ success: false, message: 'productId and amount are required' });
    }
    
    // ensure product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const bid = new Bid({
      productId: String(product._id),
      userId: req.user.id,
      amount,
      message,
      status: 'pending',
    });
    const saved = await bid.save();

    // mark product as having bids
    if (!product.isBid) {
      product.isBid = true;
      await product.save();
    }

    res.json({ success: true, data: saved });
  } catch (e) { 
    res.status(400).json({ success: false, message: e.message }); 
  }
});

// PUT /api/bids/:id (auth) — allow only product owner to accept/reject
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

    const product = await Product.findById(bid.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // only product owner may change status
    if (product.owner !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { status } = req.body;
    if (!['pending','accepted','rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    bid.status = status;
    const updated = await bid.save();

    // Auto-reject other pending bids when accepting one
    if (status === 'accepted') {
      await Bid.updateMany(
        { productId: bid.productId, _id: { $ne: bid._id }, status: 'pending' }, 
        { $set: { status: 'rejected' } }
      );
    }

    res.json({ success: true, data: updated });
  } catch (e) { 
    res.status(400).json({ success: false, message: e.message }); 
  }
});

module.exports = router;