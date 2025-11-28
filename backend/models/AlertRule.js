const mongoose = require('mongoose');

const alertRuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  condition: {
    metric: {
      type: String,
      enum: ['sentiment', 'price_change', 'volume_spike', 'composite'],
      default: 'sentiment',
    },
    operator: {
      type: String,
      enum: ['lt', 'lte', 'gt', 'gte', 'crosses_above', 'crosses_below'],
      default: 'lt',
    },
    threshold: { type: Number, required: true },
    lookbackHours: { type: Number, default: 24 },
    requireVolumeSpike: { type: Boolean, default: false },
    minMentions: { type: Number, default: 3 },
  },
  channel: {
    type: { type: String, enum: ['email', 'webhook', 'in-app'], default: 'in-app' },
    destination: { type: String },
  },
  preferences: {
    cooldownMinutes: { type: Number, default: 60 },
    includeSummary: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
  lastTriggeredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

alertRuleSchema.pre('save', function handleUpdatedAt(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('AlertRule', alertRuleSchema);
