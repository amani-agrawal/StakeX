const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();
const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Auth middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, payload) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = payload; // { userId, email }
    next();
  });
};

router.use(requireAuth);

/* =========================
 * CART (embedded: {productId, quantity, addedAt})
 * ========================= */

// GET /api/user/cart
router.get('/cart', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, { cart: 1 });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Handle migration from old cart structure (array of strings) to new structure (embedded objects)
    if (user.cart && user.cart.length > 0 && typeof user.cart[0] === 'string') {
      // Old structure detected - migrate to new structure
      const productIds = user.cart;
      user.cart = productIds.map(productId => ({
        productId: productId,
        addedAt: new Date()
      }));
      await user.save();
    }

    // Now populate the cart with product data
    await user.populate('cart.productId');
    res.json({ success: true, data: { cart: user.cart } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/user/cart  { productId }
router.post('/cart', async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Better error handling
    if (!productId) {
      return res.status(400).json({ success: false, message: 'ProductId is required' });
    }
    

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Check if item already in cart
    const existingItem = user.cart.find(item => item.productId.toString() === productId);
    if (existingItem) {
      return res.status(400).json({ success: false, message: 'Item already in cart' });
    }

    // Add item to cart
    user.cart.push({ productId, addedAt: new Date() });
    await user.save();
    res.json({ success: true, message: 'Item added to cart', data: { cart: user.cart } });
  } catch (e) {
    console.error('Cart addition error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH route removed - no quantity updates needed

// DELETE /api/user/cart/:productId
router.delete('/cart/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid productId' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const initialLength = user.cart.length;
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    
    if (user.cart.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    await user.save();
    res.json({ success: true, message: 'Item removed from cart', data: { cart: user.cart } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE /api/user/cart (clear entire cart)
router.delete('/cart', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.cart = [];
    await user.save();
    res.json({ success: true, message: 'Cart cleared', data: { cart: user.cart } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/* =========================
 * HISTORY ORDERS (embedded: {productId, priceAtPurchase, purchasedAt})
 * ========================= */

// GET /api/user/history
router.get('/history', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, { historyOrders: 1 }).populate('historyOrders.productId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { historyOrders: user.historyOrders } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/user/history  { productId, priceAtPurchase } OR { items: [{productId, priceAtPurchase}] }
router.post('/history', async (req, res) => {
  try {
    const payloads = Array.isArray(req.body.items) ? req.body.items : [{ productId: req.body.productId, priceAtPurchase: req.body.priceAtPurchase }];
    if (!payloads.length) return res.status(400).json({ success: false, message: 'No items provided' });

    // Validate all items
    for (const p of payloads) {
      if (!p || !isObjectId(p.productId) || typeof p.priceAtPurchase !== 'number' || p.priceAtPurchase < 0)
        return res.status(400).json({ success: false, message: 'Invalid item in payload' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Add all items to history
    for (const p of payloads) {
      user.historyOrders.push({ 
        productId: p.productId, 
        priceAtPurchase: p.priceAtPurchase, 
        purchasedAt: new Date() 
      });
    }

    // Optional: clear cart if purchasing from cart
    if (req.body.clearCart) user.cart = [];

    await user.save();
    res.json({ success: true, message: 'Orders recorded', data: { historyOrders: user.historyOrders, cart: user.cart } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE /api/user/history/:productId
router.delete('/history/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid productId' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const initialLength = user.historyOrders.length;
    user.historyOrders = user.historyOrders.filter(order => order.productId.toString() !== productId);
    
    if (user.historyOrders.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Order not found in history' });
    }

    await user.save();
    res.json({ success: true, message: 'Order removed from history', data: { historyOrders: user.historyOrders } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/user/history/stats
router.get('/history/stats', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, { historyOrders: 1 });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const totalOrders = user.historyOrders.length;
    const totalSpent = user.historyOrders.reduce((sum, order) => sum + (order.priceAtPurchase || 0), 0);
    
    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/* =========================
 * ONGOING BIDS (embedded: {productId, amount, placedAt})
 * ========================= */

// GET /api/user/bids
router.get('/bids', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, { ongoingBids: 1 }).populate('ongoingBids.productId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { ongoingBids: user.ongoingBids } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/user/bids  { productId, amount }
router.post('/bids', async (req, res) => {
  try {
    const { productId, amount } = req.body;
    if (!isObjectId(productId) || typeof amount !== 'number' || amount <= 0)
      return res.status(400).json({ success: false, message: 'Invalid payload' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if user is not the owner
    if (product.owner === req.user.userId) {
      return res.status(400).json({ success: false, message: 'You cannot bid on your own product' });
    }

    // Update or add bid
    const existingBid = user.ongoingBids.find(bid => bid.productId.toString() === productId);
    if (existingBid) {
      existingBid.amount = amount;
      existingBid.placedAt = new Date();
    } else {
      user.ongoingBids.push({ productId, amount, placedAt: new Date() });
    }

    await user.save();
    res.json({ success: true, message: 'Bid recorded', data: { ongoingBids: user.ongoingBids } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE /api/user/bids/:productId
router.delete('/bids/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid productId' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const initialLength = user.ongoingBids.length;
    user.ongoingBids = user.ongoingBids.filter(bid => bid.productId.toString() !== productId);
    
    if (user.ongoingBids.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    await user.save();
    res.json({ success: true, message: 'Bid removed', data: { ongoingBids: user.ongoingBids } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/* =========================
 * ITEMS TO SELL (embedded: {productId, askingPrice, listedAt})
 * ========================= */

// GET /api/user/sell
router.get('/sell', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, { itemsToSell: 1 }).populate('itemsToSell.productId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { itemsToSell: user.itemsToSell } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/user/sell { productId, askingPrice }
router.post('/sell', async (req, res) => {
  try {
    const { productId, askingPrice } = req.body;
    if (!isObjectId(productId) || (askingPrice !== undefined && (typeof askingPrice !== 'number' || askingPrice < 0)))
      return res.status(400).json({ success: false, message: 'Invalid payload' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if user owns the product
    if (product.owner !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only list your own products' });
    }

    const existingItem = user.itemsToSell.find(item => item.productId.toString() === productId);
    if (existingItem) {
      if (askingPrice !== undefined) existingItem.askingPrice = askingPrice;
    } else {
      user.itemsToSell.push({ productId, askingPrice, listedAt: new Date() });
    }

    await user.save();
    res.json({ success: true, message: 'Item listed for sale', data: { itemsToSell: user.itemsToSell } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/user/sell { productId, askingPrice }
router.patch('/sell', async (req, res) => {
  try {
    const { productId, askingPrice } = req.body;
    if (!isObjectId(productId) || typeof askingPrice !== 'number' || askingPrice < 0)
      return res.status(400).json({ success: false, message: 'Invalid payload' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const item = user.itemsToSell.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not listed for sale' });

    item.askingPrice = askingPrice;
    await user.save();
    res.json({ success: true, message: 'Asking price updated', data: { itemsToSell: user.itemsToSell } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// DELETE /api/user/sell/:productId
router.delete('/sell/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid productId' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const initialLength = user.itemsToSell.length;
    user.itemsToSell = user.itemsToSell.filter(item => item.productId.toString() !== productId);
    
    if (user.itemsToSell.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Item not found in sell list' });
    }

    await user.save();
    res.json({ success: true, message: 'Item unlisted', data: { itemsToSell: user.itemsToSell } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
