const Sentiment = require('sentiment');
const vader = require('vader-sentiment');
const axios = require('axios');

const lexiconAnalyzer = new Sentiment();

const DEFAULT_THRESHOLDS = {
  positive: 0.15,
  negative: -0.15,
};

function clamp(value, min = -1, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function determineLabel(score, thresholds = DEFAULT_THRESHOLDS) {
  if (score >= thresholds.positive) return 'positive';
  if (score <= thresholds.negative) return 'negative';
  return 'neutral';
}

function computeConsensusConfidence(models) {
  if (!models.length) return 0;
  const avg = models.reduce((acc, model) => acc + model.score, 0) / models.length;
  const variance = models.reduce((acc, model) => acc + Math.pow(model.score - avg, 2), 0) / models.length;
  const normalizedVariance = 1 - Math.min(1, variance * 2); // higher variance => lower confidence
  const avgModelConfidence = models.reduce((acc, model) => acc + (model.confidence || 0.5), 0) / models.length;
  return clamp((normalizedVariance + avgModelConfidence) / 2, 0, 1);
}

function runLexiconModel(text) {
  const result = lexiconAnalyzer.analyze(text);
  const normalizedScore = clamp(result.score / 10);
  return {
    name: 'lexicon',
    score: normalizedScore,
    confidence: clamp(Math.abs(normalizedScore)),
    weight: 0.25,
    meta: {
      comparative: result.comparative,
      positive: result.positive.length,
      negative: result.negative.length,
      tokens: result.tokens.length,
    },
    breakdown: {
      positive: result.positive.length,
      negative: result.negative.length,
      neutral: result.tokens.length - (result.positive.length + result.negative.length),
    },
  };
}

function runVaderModel(text) {
  const result = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  return {
    name: 'vader',
    score: clamp(result.compound),
    confidence: clamp(1 - Math.abs(result.neu - 0.5)),
    weight: 0.35,
    breakdown: {
      positive: result.pos,
      negative: result.neg,
      neutral: result.neu,
    },
  };
}

function runKeywordModel(text) {
  const lower = text.toLowerCase();
  const bullish = ['beat estimates', 'upgrade', 'strong demand', 'record high', 'buyback'];
  const bearish = ['missed estimates', 'downgrade', 'investigation', 'default', 'selloff'];
  let score = 0;
  bullish.forEach(keyword => {
    if (lower.includes(keyword)) score += 0.1;
  });
  bearish.forEach(keyword => {
    if (lower.includes(keyword)) score -= 0.1;
  });
  score = clamp(score);
  return {
    name: 'keyword_rules',
    score,
    confidence: Math.min(0.6, Math.abs(score)),
    weight: 0.15,
    breakdown: {
      bullishMentions: bullish.filter(keyword => lower.includes(keyword)),
      bearishMentions: bearish.filter(keyword => lower.includes(keyword)),
    },
  };
}

async function runFinbertModel(text) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/ProsusAI/finbert',
      { inputs: text.slice(0, 512) },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 7000,
      }
    );

    const [scores] = response.data;
    if (!scores) {
      return null;
    }

    const labelScores = scores.reduce((acc, item) => {
      acc[item.label.toLowerCase()] = item.score;
      return acc;
    }, {});

    const score = clamp((labelScores.positive || 0) - (labelScores.negative || 0));

    return {
      name: 'finbert',
      score,
      confidence: Math.max(labelScores.positive || 0, labelScores.negative || 0),
      weight: 0.4,
      breakdown: labelScores,
    };
  } catch (error) {
    console.warn('FinBERT inference failed:', error.message);
    return null;
  }
}

function deriveSignals(text) {
  const lower = text.toLowerCase();
  const signals = [];
  if (lower.includes('downgrade') || lower.includes('cut to')) {
    signals.push({ type: 'analyst', description: 'Analyst downgrade', strength: 0.7 });
  }
  if (lower.includes('upgrade')) {
    signals.push({ type: 'analyst', description: 'Analyst upgrade', strength: 0.7 });
  }
  if (lower.includes('investigation') || lower.includes('probe')) {
    signals.push({ type: 'risk', description: 'Regulatory investigation mentioned', strength: 0.6 });
  }
  if (lower.includes('record high') || lower.includes('all-time high')) {
    signals.push({ type: 'momentum', description: 'Record high mention', strength: 0.5 });
  }
  return signals;
}

async function analyzeTextWithEnsemble(text, options = {}) {
  if (!text || !text.trim()) {
    return null;
  }

  const models = [runLexiconModel(text), runVaderModel(text), runKeywordModel(text)];
  const finbert = await runFinbertModel(text);
  if (finbert) {
    models.push(finbert);
  }

  const totalWeight = models.reduce((acc, model) => acc + (model.weight || 0.25), 0) || 1;
  const weightedScore = models.reduce(
    (acc, model) => acc + model.score * (model.weight || 0.25),
    0
  ) / totalWeight;

  const confidence = computeConsensusConfidence(models);
  const label = determineLabel(weightedScore, options.thresholds);
  const aggregateBreakdown = models.reduce(
    (acc, model) => {
      if (model.breakdown) {
        acc.push({ name: model.name, breakdown: model.breakdown });
      }
      return acc;
    },
    []
  );

  return {
    sentimentScore: parseFloat(clamp(weightedScore).toFixed(4)),
    sentimentLabel: label,
    compoundScore: weightedScore,
    positiveScore: Math.max(...models.map(m => m.breakdown?.positive || 0), 0),
    negativeScore: Math.max(...models.map(m => m.breakdown?.negative || 0), 0),
    neutralScore: Math.max(...models.map(m => m.breakdown?.neutral || 0), 0),
    confidence: parseFloat(confidence.toFixed(3)),
    modelBreakdown: models,
    signals: deriveSignals(text),
    breakdownDetails: aggregateBreakdown,
  };
}

module.exports = {
  analyzeTextWithEnsemble,
  deriveSignals,
};
