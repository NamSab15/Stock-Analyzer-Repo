// backend/models/Stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  exchange: { type: String, enum: ['NSE', 'BSE'], default: 'NSE' },
  currentPrice: Number,
  previousClose: Number,
  change: Number,
  changePercent: Number,
  dayHigh: Number,
  dayLow: Number,
  high52Week: Number,
  low52Week: Number,
  volume: Number,
  marketCap: Number,
  lastUpdated: { type: Date, default: Date.now },
});

const sentimentSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  fetchedAt: { type: Date, default: Date.now },
  source: { type: String, required: true },
  sourceType: {
    type: String,
    enum: ['news', 'social', 'transcript', 'analyst', 'other'],
    default: 'news',
  },
  provider: { type: String, default: 'unknown' },
  externalId: { type: String, index: true },
  language: { type: String, default: 'en' },
  headline: String,
  content: String,
  url: String,
  metadata: { type: mongoose.Schema.Types.Mixed },
  sentimentScore: { type: Number, min: -1, max: 1 },
  sentimentLabel: { type: String, enum: ['positive', 'negative', 'neutral'] },
  compoundScore: Number,
  positiveScore: Number,
  negativeScore: Number,
  neutralScore: Number,
  confidence: { type: Number, min: 0, max: 1, default: 0.5 },
  sampleSize: { type: Number, default: 1 },
  modelBreakdown: [{
    name: String,
    score: Number,
    confidence: Number,
    weight: Number,
  }],
  signals: [{
    type: { type: String },
    description: String,
    strength: Number,
  }],
  dataFreshnessMinutes: Number,
  qualityScore: { type: Number, min: 0, max: 1 },
});

sentimentSchema.index({ symbol: 1, timestamp: -1 });
sentimentSchema.index({ symbol: 1, provider: 1, externalId: 1 }, { unique: false });

const sentimentAggregateSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  date: { type: Date, required: true },
  hour: { type: Number, min: 0, max: 23 },
  avgSentiment: Number,
  avgConfidence: Number,
  totalMentions: Number,
  positive: Number,
  negative: Number,
  neutral: Number,
  sourceBreakdown: {
    news: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
    transcript: { type: Number, default: 0 },
    analyst: { type: Number, default: 0 },
  },
  trend: {
    type: String,
    enum: ['very bullish', 'bullish', 'neutral', 'bearish', 'very bearish'],
    default: 'neutral',
  },
  timestamp: { type: Date, default: Date.now },
});

const Stock = mongoose.model('Stock', stockSchema);
const Sentiment = mongoose.model('Sentiment', sentimentSchema);
const SentimentAggregate = mongoose.model('SentimentAggregate', sentimentAggregateSchema);

module.exports = { Stock, Sentiment, SentimentAggregate };