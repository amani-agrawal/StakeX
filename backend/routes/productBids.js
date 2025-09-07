const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Authentication middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, payload) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = payload; // { userId, email }
    next();
  });
};

// GET /api/product-bids/:productId - Get bids for a specific product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const totalBids = product.bids.reduce((sum, bid) => sum + bid, 0);
    const averageBid = product.bids.length > 0 ? totalBids / product.bids.length : 0;
    const highestBid = product.bids.length > 0 ? Math.max(...product.bids) : 0;

    res.json({ 
      success: true, 
      data: {
        productId: product._id,
        bids: product.bids,
        totalBids: product.bids.length,
        totalAmount: totalBids,
        averageBid: averageBid,
        highestBid: highestBid,
        demandValue: product.demandValue
      }
    });
  } catch (error) {
    console.error('Error fetching product bids:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/product-bids/:productId - Add a bid to a product
router.post('/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { amount } = req.body;
    
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid bid amount is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user is not the owner
    if (product.owner === req.user.userId) {
      return res.status(400).json({ success: false, message: 'You cannot bid on your own product' });
    }

    // Add bid to the product's bids array
    product.bids.push(amount);
    
    // Recalculate demandValue
    const totalBids = product.bids.reduce((sum, bid) => sum + bid, 0);
    const newDemandValue = Math.max(0, (product.isMarketItem && product.initialBid ? product.price - product.initialBid : product.price) - totalBids);
    product.demandValue = newDemandValue;
    
    await product.save();

    res.json({ 
      success: true, 
      message: 'Bid added successfully',
      data: {
        productId: product._id,
        newBid: amount,
        totalBids: product.bids.length,
        totalAmount: totalBids,
        demandValue: product.demandValue
      }
    });
  } catch (error) {
    console.error('Error adding bid:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/product-bids/:productId/:bidIndex - Remove a specific bid (by index)
router.delete('/:productId/:bidIndex', requireAuth, async (req, res) => {
  try {
    const { productId, bidIndex } = req.params;
    const index = parseInt(bidIndex);
    
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ success: false, message: 'Invalid bid index' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user is the owner (only owner can remove bids)
    if (product.owner !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only product owner can remove bids' });
    }

    if (index >= product.bids.length) {
      return res.status(400).json({ success: false, message: 'Bid index out of range' });
    }

    const removedBid = product.bids[index];
    product.bids.splice(index, 1);
    
    // Recalculate demandValue
    const totalBids = product.bids.reduce((sum, bid) => sum + bid, 0);
    const newDemandValue = Math.max(0, (product.isMarketItem && product.initialBid ? product.price - product.initialBid : product.price) - totalBids);
    product.demandValue = newDemandValue;
    
    await product.save();

    res.json({ 
      success: true, 
      message: 'Bid removed successfully',
      data: {
        productId: product._id,
        removedBid: removedBid,
        totalBids: product.bids.length,
        totalAmount: totalBids,
        demandValue: product.demandValue
      }
    });
  } catch (error) {
    console.error('Error removing bid:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/product-bids/:productId - Update all bids for a product (admin/owner only)
router.put('/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { bids } = req.body;
    
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    
    if (!Array.isArray(bids)) {
      return res.status(400).json({ success: false, message: 'Bids must be an array' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user is the owner
    if (product.owner !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Only product owner can update bids' });
    }

    // Validate all bids are numbers
    const validBids = bids.filter(bid => typeof bid === 'number' && bid > 0);
    
    product.bids = validBids;
    
    // Recalculate demandValue
    const totalBids = product.bids.reduce((sum, bid) => sum + bid, 0);
    const newDemandValue = Math.max(0, (product.isMarketItem && product.initialBid ? product.price - product.initialBid : product.price) - totalBids);
    product.demandValue = newDemandValue;
    
    await product.save();

    res.json({ 
      success: true, 
      message: 'Bids updated successfully',
      data: {
        productId: product._id,
        bids: product.bids,
        totalBids: product.bids.length,
        totalAmount: totalBids,
        demandValue: product.demandValue
      }
    });
  } catch (error) {
    console.error('Error updating bids:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
