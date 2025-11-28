const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't return password by default
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  watchlist: [{
    type: String, // Stock symbol
    ref: 'Stock'
  }],
  sentimentPreferences: {
    sources: {
      type: [String],
      default: ['news', 'social', 'analyst', 'transcript'],
    },
    minConfidence: { type: Number, default: 0.4 },
    sentimentThresholds: {
      bullish: { type: Number, default: 0.2 },
      bearish: { type: Number, default: -0.2 },
    },
    alertChannels: {
      email: {
        enabled: { type: Boolean, default: false },
        address: { type: String },
      },
      webhook: {
        enabled: { type: Boolean, default: false },
        url: { type: String },
      },
      inApp: {
        enabled: { type: Boolean, default: true },
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving & maintain updatedAt
userSchema.pre('save', async function handlePasswordHash(next) {
  this.updatedAt = new Date();

  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
