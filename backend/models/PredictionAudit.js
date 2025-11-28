const mongoose = require('mongoose');

const predictionAuditSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  predictionTimestamp: { type: Date, required: true },
  horizonHours: { type: Number, default: 24 },
  predictedDirection: { type: String, enum: ['bullish', 'bearish', 'neutral'] },
  predictedChangePercent: Number,
  confidence: Number,
  rationale: String,
  actualDirection: { type: String, enum: ['bullish', 'bearish', 'neutral', 'pending'], default: 'pending' },
  actualChangePercent: Number,
  status: { type: String, enum: ['pending', 'matched', 'missed'], default: 'pending' },
  evaluatedAt: Date,
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PredictionAudit', predictionAuditSchema);
