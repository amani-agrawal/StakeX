const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, payload) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = payload; // { userId, email }
    next();
  });
};

// Get user profile
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('cart.productId', 'name image price')
      .populate('historyOrders.productId', 'name image price')
      .populate('ongoingBids.productId', 'name image price')
      .populate('itemsToSell.productId', 'name image price');

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
router.put('/:userId', requireAuth, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const allowedUpdates = ['name', 'age', 'address', 'phone', 'profilePicture'];
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

// Cart operations are now handled by /api/user/cart routes in userLists.js

module.exports = router;
