const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Get user profile
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('cart', 'name image price')
      .populate('historyOrders', 'name image price')
      .populate('ongoingBids', 'amount status')
      .populate('itemsToSell', 'name image price onMarket');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.params.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const allowedUpdates = ['name', 'age', 'address', 'profilePicture'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add item to cart
router.post('/:userId/cart', authenticateToken, async (req, res) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { productId } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $addToSet: { cart: productId } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Item added to cart',
      data: user.cart
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove item from cart
router.delete('/:userId/cart/:productId', authenticateToken, async (req, res) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { cart: req.params.productId } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: user.cart
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
