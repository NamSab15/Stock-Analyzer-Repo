const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validate input
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
    });

    // Create token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        watchlist: user.watchlist,
        sentimentPreferences: user.sentimentPreferences,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user (select password because it's not selected by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        watchlist: user.watchlist,
        sentimentPreferences: user.sentimentPreferences,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        watchlist: user.watchlist,
        sentimentPreferences: user.sentimentPreferences,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/watchlist/add
// @desc    Add stock to watchlist
// @access  Private
router.put('/watchlist/add', protect, async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ success: false, message: 'Please provide a symbol' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { watchlist: symbol } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/watchlist/remove
// @desc    Remove stock from watchlist
// @access  Private
router.put('/watchlist/remove', protect, async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ success: false, message: 'Please provide a symbol' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { watchlist: symbol } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/watchlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user.watchlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/preferences/sentiment
// @desc    Update sentiment preferences
// @access  Private
router.put('/preferences/sentiment', protect, async (req, res) => {
  try {
    const { sources, minConfidence, thresholds, alertChannels } = req.body;

    const update = {};
    if (Array.isArray(sources)) {
      update['sentimentPreferences.sources'] = sources;
    }
    if (typeof minConfidence === 'number') {
      update['sentimentPreferences.minConfidence'] = minConfidence;
    }
    if (thresholds) {
      if (typeof thresholds.bullish === 'number') {
        update['sentimentPreferences.sentimentThresholds.bullish'] = thresholds.bullish;
      }
      if (typeof thresholds.bearish === 'number') {
        update['sentimentPreferences.sentimentThresholds.bearish'] = thresholds.bearish;
      }
    }
    if (alertChannels) {
      Object.keys(alertChannels).forEach(channel => {
        update[`sentimentPreferences.alertChannels.${channel}`] = alertChannels[channel];
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user.sentimentPreferences,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/preferences/sentiment
// @desc    Retrieve sentiment preferences
// @access  Private
router.get('/preferences/sentiment', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user.sentimentPreferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
