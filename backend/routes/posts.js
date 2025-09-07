const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Product = require('../models/Product');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 File filter:', { 
      filename: file.originalname, 
      mimetype: file.mimetype, 
      size: file.size 
    });
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only image files are allowed`), false);
    }
  }
});

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 Auth header:', authHeader);
  
  const token = authHeader?.split(' ')[1];
  console.log('🎫 Extracted token:', token ? 'Token present' : 'No token');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, payload) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    console.log('✅ Token verified, payload:', payload);
    req.user = payload; // { userId, email }
    console.log('👤 Mapped user:', req.user);
    next();
  });
};

// GET /api/posts (all; optional filters)
router.get('', async (req, res) => {
  try {
    const { owner } = req.query;
    const query = owner ? { owner } : {};
    const list = await Product.find(query).sort({ createdAt: -1 }).lean();
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
    const out = list.map((p) => ({
      ...p,
      imageUrl: p.image?.data ? `${baseUrl}/api/posts/${p._id}/image` : p.imageUrl,
    }));
    return res.json({ success: true, data: out });
  } catch (e) {
    console.error('Error in GET /api/posts:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
    const productWithUrl = {
      ...p,
      imageUrl: p.image?.data ? `${baseUrl}/api/posts/${p._id}/image` : p.imageUrl,
    };
    res.json({ success: true, data: productWithUrl });
  } catch (e) {
    console.error('Error in GET /api/posts/:id:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/posts (auth, owner comes from token, with file upload)
router.post('', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('🚨 Multer error:', { message: err.message, stack: err.stack });
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, description, owner, price, onMarket, isMarketItem, initialBid, daoId } = req.body;
    
    console.log('📥 Received form data:', { name, description, owner, price, onMarket, isMarketItem, initialBid, daoId });
    console.log('📁 File received:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Name and description are required' });
    }
    if (!owner) {
      return res.status(400).json({ success: false, message: 'Owner is required' });
    }
    if (!daoId) {
      return res.status(400).json({ success: false, message: 'daoId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    // Validate price - FormData sends everything as strings
    const priceStr = price;
    if (!priceStr) {
      return res.status(400).json({ success: false, message: 'Price is required' });
    }
    
    const numericPrice = Number(priceStr);
    if (isNaN(numericPrice) || !Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Price must be a valid positive number. Received: "${priceStr}"` 
      });
    }

    // Validate initialBid for market items
    const isMarketItemBool = isMarketItem === 'true' || isMarketItem === true;
    let numericInitialBid = 0;
    
    if (isMarketItemBool) {
      if (!initialBid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Initial bid is required for market items' 
        });
      }
      
      numericInitialBid = Number(initialBid);
      if (isNaN(numericInitialBid) || !Number.isFinite(numericInitialBid) || numericInitialBid <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Initial bid must be a valid positive number. Received: "${initialBid}"` 
        });
      }
      
      if (numericInitialBid >= numericPrice) {
        return res.status(400).json({ 
          success: false, 
          message: 'Initial bid must be less than the product price' 
        });
      }
    }

    // Calculate initial demandValue
    const initialDemandValue = isMarketItemBool ? numericPrice - numericInitialBid : numericPrice;

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      owner,
      daoId,
      price: numericPrice,
      demandValue: initialDemandValue,
      onMarket: onMarket !== 'false',
      isMarketItem: isMarketItemBool,
      initialBid: isMarketItemBool ? numericInitialBid : undefined,
      bids: [],
    });

    product.image = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      filename: req.file.originalname,
      size: req.file.size,
    };

    console.log('💾 About to save product with image:', {
      hasImageData: !!product.image?.data,
      imageSize: product.image?.data?.length,
      contentType: product.image?.contentType,
      filename: product.image?.filename,
      productName: product.name
    });

    const saved = await product.save();
    
    console.log('💾 Product saved successfully:', {
      _id: saved._id,
      hasImageData: !!saved.image?.data,
      imageSize: saved.image?.data?.length,
      contentType: saved.image?.contentType,
      filename: saved.image?.filename
    });

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
    return res.json({
      success: true,
      data: {
        ...saved.toObject(),
        imageUrl: saved.image?.data ? `${baseUrl}/api/posts/${saved._id}/image` : saved.imageUrl,
      },
    });
  } catch (err) {
    console.error('🚨 Create product error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// PUT /api/posts/:id (auth, only owner can edit)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    if (p.owner !== req.user.userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const allowed = ['name', 'description', 'image', 'price', 'onMarket', 'isMarketItem', 'initialBid', 'demandValue', 'yearsOfUse', 'authenticityCertificate', 'demandPrice', 'isRentable', 'daoId'];
    const update = {};
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];

    // Recalculate demandValue if price or initialBid changes (but not if demandValue is being set directly)
    console.log('🔍 PUT update debug:', { 
      updateKeys: Object.keys(update), 
      hasPrice: 'price' in update, 
      hasInitialBid: 'initialBid' in update, 
      hasDemandValue: 'demandValue' in update 
    });
    if (('price' in update || 'initialBid' in update) && !('demandValue' in update)) {
      const newPrice = update.price || p.price;
      const newInitialBid = update.initialBid || p.initialBid || 0;
      update.demandValue = p.isMarketItem ? Math.max(0, newPrice - newInitialBid) : newPrice;
      console.log('🔄 Recalculated demandValue:', update.demandValue);
    } else {
      console.log('✅ Keeping existing demandValue:', update.demandValue);
    }

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
    if (p.owner !== req.user.userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    await Product.findByIdAndDelete(p._id);
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// GET /api/posts/:id/image (serve image from MongoDB)
router.get('/:id/image', async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id).lean();
    if (!doc?.image?.data) return res.status(404).send('Not found');

    res.set('Content-Type', doc.image.contentType || 'application/octet-stream');
    return res.send(doc.image.data);
  } catch {
    return res.status(404).send('Not found');
  }
});

module.exports = router;