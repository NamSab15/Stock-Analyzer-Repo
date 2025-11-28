const PredictionAudit = require('../models/PredictionAudit');
const { fetchStockData } = require('./stockService');

function resolveDirection(changePercent = 0) {
  if (changePercent > 0.2) return 'bullish';
  if (changePercent < -0.2) return 'bearish';
  return 'neutral';
}

function normalizeSignalDirection(signal) {
  const normalized = (signal || '').toString().toUpperCase();
  if (!normalized) return 'neutral';
  if (normalized.includes('BUY')) return 'bullish';
  if (normalized.includes('SELL')) return 'bearish';
  if (normalized.includes('BULL')) return 'bullish';
  if (normalized.includes('BEAR')) return 'bearish';
  return 'neutral';
}

async function recordPrediction(symbol, prediction, context = {}) {
  const priceSnapshot = context.priceAtPrediction || context.currentPrice || null;
  const predictedSignal = prediction?.prediction?.signal || prediction?.signal;

  await PredictionAudit.create({
    symbol,
    predictionTimestamp: context.timestamp || new Date(),
    horizonHours: prediction?.horizonHours || 24,
    predictedDirection: normalizeSignalDirection(predictedSignal),
    predictedChangePercent: prediction?.prediction?.expectedMovePercent || prediction?.expectedMovePercent,
    confidence: prediction?.prediction?.confidence || prediction?.confidence,
    rationale: prediction?.prediction?.reasoning || prediction?.reasoning,
    metadata: {
      ...context.metadata,
      priceAtPrediction: priceSnapshot,
    },
  });
}

async function evaluatePendingPredictions() {
  const pending = await PredictionAudit.find({ status: 'pending' }).limit(50);
  for (const audit of pending) {
    const ageHours = (Date.now() - audit.predictionTimestamp.getTime()) / (1000 * 60 * 60);
    if (ageHours < (audit.horizonHours || 24)) {
      continue;
    }

    const baselinePrice = audit.metadata?.priceAtPrediction;
    if (!baselinePrice) {
      await PredictionAudit.findByIdAndUpdate(audit._id, { status: 'missed', evaluatedAt: new Date(), actualDirection: 'pending' });
      continue;
    }

    const latest = await fetchStockData(audit.symbol);
    if (!latest || !latest.currentPrice) {
      continue;
    }

    const changePercent = ((latest.currentPrice - baselinePrice) / baselinePrice) * 100;
    const actualDirection = resolveDirection(changePercent);
    const status = actualDirection === audit.predictedDirection ? 'matched' : 'missed';

    await PredictionAudit.findByIdAndUpdate(audit._id, {
      status,
      actualDirection,
      actualChangePercent: changePercent,
      evaluatedAt: new Date(),
    });
  }
}

let intervalId;

function startPredictionValidationLoop() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    evaluatePendingPredictions().catch(err => console.error('Prediction validation failed:', err.message));
  }, 60 * 60 * 1000); // hourly
}

module.exports = {
  recordPrediction,
  evaluatePendingPredictions,
  startPredictionValidationLoop,
};
