const mongoose = require('mongoose');

const alertEventSchema = new mongoose.Schema({
  ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AlertRule', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  symbol: { type: String, required: true },
  status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
  channel: { type: String, enum: ['email', 'webhook', 'in-app'], default: 'in-app' },
  summary: { type: String },
  payload: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date },
  error: { type: String },
});

module.exports = mongoose.model('AlertEvent', alertEventSchema);
