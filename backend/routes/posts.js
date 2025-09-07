const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const Bid = require('../models/Bid');

const router = express.Router();

// Authentication middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 Auth header:', authHeader);
  
  const token = authHeader?.split(' ')[1];
  console.log('🎫 Extracted token:', token ? 'Token present' : 'No token');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    console.log('✅ Token verified, payload:', payload);
    // JWT payload has 'userId', not 'id'
    req.user = { id: payload.userId }; // Map userId to id for consistency
    console.log('👤 Mapped user:', req.user);
    next();
  });
};

// GET /api/posts (all; optional filters)
router.get('', async (req, res) => {
  try {
    const { owner } = req.query; // optional ?owner=<userId>
    const query = owner ? { owner } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (e) { 
    res.status(500).json({ success: false, message: e.message }); 
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: p });
  } catch (e) { 
    res.status(500).json({ success: false, message: e.message }); 
  }
});

// POST /api/posts (auth, owner comes from token)
router.post('', requireAuth, async (req, res) => {
  try {
    const body = req.body || {};
    console.log('📥 Backend received body:', body);
    console.log('👤 Backend user from token:', req.user);
    console.log('🔍 Body keys:', Object.keys(body));
    console.log('🔍 Body values:', Object.values(body));
    
    // Ensure price is set from either price or value field
    const finalPrice = body.price || body.value;
    if (!finalPrice || !Number.isFinite(finalPrice)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price/value is required and must be a valid number' 
      });
    }

    const product = new Product({
      ...body,
      owner: req.user.id,          // enforce owner from token
      isOwned: true,
      price: finalPrice,           // ensure price is always set
      value: finalPrice,           // also set value for compatibility
      // Handle on_market alias
      ...(body.on_market && { onMarket: body.on_market }),
    });
    
    console.log('📦 Product object before save:', {
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      value: product.value,
      owner: product.owner,
      isOwned: product.isOwned
    });
    const saved = await product.save();
    console.log('✅ Product saved successfully:', saved);
    res.json({ success: true, data: saved });
  } catch (e) { 
    console.error('❌ Product creation error:', e);
    res.status(400).json({ success: false, message: e.message }); 
  }
});

// PUT /api/posts/:id (auth, only owner can edit)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    if (p.owner !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    const allowed = ['name','description','image','images','price','onMarket','isMarketItem','yearsOfUse','authenticityCertificate','demandPrice','isRentable'];
    const update = {};
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];

    const updated = await Product.findByIdAndUpdate(p._id, { $set: update }, { new: true });
    res.json({ success: true, data: updated });
  } catch (e) { 
    res.status(400).json({ success: false, message: e.message }); 
  }
});

// DELETE /api/posts/:id (auth, only owner)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    if (p.owner !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });

    await Product.findByIdAndDelete(p._id);
    // cascade delete bids for this product
    await Bid.deleteMany({ productId: String(p._id) });
    res.status(204).end();
  } catch (e) { 
    res.status(400).json({ success: false, message: e.message }); 
  }
});

module.exports = router;