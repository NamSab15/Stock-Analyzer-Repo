// backend/services/sentimentService.js - ENSEMBLE + MULTI-SOURCE
const { Sentiment: SentimentModel, SentimentAggregate } = require('../models/Stock');
const { broadcastSentimentAlert } = require('../utils/websocket');
const { evaluateAlertsForSymbol } = require('./alertService');
const { fetchNewsForStock } = require('./newsService');
const { getAllStocksList } = require('./stockService');
const { fetchExtendedSentimentSources } = require('./sentimentSources');
const { analyzeTextWithEnsemble } = require('./sentimentAnalyzers');
const { evaluateAlertsForSymbol } = require('./alertService');

const SOURCE_TYPE_DEFAULTS = {
  news: { provider: 'news', sourceType: 'news' },
  social: { provider: 'social', sourceType: 'social' },
};

function clamp(value, min = -1, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function toCompanyName(symbol = '') {
  return symbol.replace('.NS', '').replace('.BO', '');
}

function computeQualityScore(entry, analysis) {
  let score = 0.5;
  if (entry.sourceType === 'news') score += 0.1;
  if (entry.sourceType === 'transcript') score += 0.15;
  if (entry.metadata?.metrics?.like_count) score += Math.min(0.1, entry.metadata.metrics.like_count / 1000);
  if (entry.metadata?.score) score += Math.min(0.1, entry.metadata.score / 100);
  if (analysis?.confidence) score += analysis.confidence * 0.2;
  return clamp(score, 0, 1);
}

function normalizeArticles(symbol, articles = []) {
  return articles.map(article => ({
    externalId: article.url,
    title: article.title,
    text: `${article.title || ''} ${article.description || ''}`.trim(),
    url: article.url,
    source: article.source || 'news',
    sourceType: 'news',
    provider: article.source || SOURCE_TYPE_DEFAULTS.news.provider,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
    metadata: {
      author: article.author,
    },
  }));
}

async function saveSentimentDocument(symbol, entry, analysis) {
  const text = entry.text || entry.content;
  if (!text || !analysis) return null;

  const dedupeQuery = entry.externalId
    ? { symbol, externalId: entry.externalId }
    : {
        symbol,
        headline: entry.title,
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      };

  const existing = await SentimentModel.findOne(dedupeQuery);
  if (existing) {
    return null;
  }

  const freshnessMinutes = entry.publishedAt
    ? Math.round((Date.now() - new Date(entry.publishedAt).getTime()) / (1000 * 60))
    : null;

  const sentimentDoc = new SentimentModel({
    symbol,
    source: entry.source || entry.provider || 'news',
    sourceType: entry.sourceType || SOURCE_TYPE_DEFAULTS.news.sourceType,
    provider: entry.provider || entry.source || 'news',
    externalId: entry.externalId,
    headline: entry.title,
    content: text.slice(0, 4000),
    url: entry.url,
    language: entry.metadata?.language || 'en',
    metadata: entry.metadata,
    sampleSize: entry.metadata?.sampleSize || (text.split(' ').length || 1),
    dataFreshnessMinutes: freshnessMinutes,
    qualityScore: computeQualityScore(entry, analysis),
    ...analysis,
  });

  await sentimentDoc.save();
  return sentimentDoc;
}

async function processNewsSentiment(symbol, stockName) {
  try {
    const companyName = stockName || toCompanyName(symbol);
    const [newsArticles, extendedSources] = await Promise.all([
      fetchNewsForStock(symbol, companyName),
      fetchExtendedSentimentSources(symbol, companyName),
    ]);

    const normalizedNews = normalizeArticles(symbol, newsArticles);
    const combinedEntries = [...normalizedNews, ...extendedSources];

    if (!combinedEntries.length) {
      console.log(`⚠️  No sentiment sources found for ${symbol}`);
      return [];
    }

    const savedDocs = [];
    const seen = new Set();

    for (const entry of combinedEntries) {
      if (entry.externalId && seen.has(entry.externalId)) continue;
      if (entry.externalId) seen.add(entry.externalId);

      const analysis = await analyzeTextWithEnsemble(entry.text || entry.content || entry.title);
      if (!analysis) continue;

      const saved = await saveSentimentDocument(symbol, entry, analysis);
      if (saved) {
        savedDocs.push(saved);
      }

      await new Promise(resolve => setTimeout(resolve, 250));
    }

    console.log(`✅ Processed ${savedDocs.length} sentiment datapoints for ${symbol}`);
    return savedDocs;
  } catch (error) {
    console.error(`Error processing sentiment for ${symbol}:`, error.message);
    return [];
  }
}

function determineTrend(avgSentiment) {
  if (avgSentiment > 0.3) return 'very bullish';
  if (avgSentiment > 0.1) return 'bullish';
  if (avgSentiment < -0.3) return 'very bearish';
  if (avgSentiment < -0.1) return 'bearish';
  return 'neutral';
}

async function recordAggregateSnapshot(symbol, aggregate) {
  if (!aggregate) return;
  const now = new Date();
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  await SentimentAggregate.findOneAndUpdate(
    { symbol, date: day, hour: now.getHours() },
    {
      avgSentiment: aggregate.avgSentiment,
      avgConfidence: aggregate.avgConfidence,
      totalMentions: aggregate.totalMentions,
      positive: aggregate.positiveCount,
      negative: aggregate.negativeCount,
      neutral: aggregate.neutralCount,
      sourceBreakdown: aggregate.sourceBreakdown,
      trend: aggregate.sentimentTrend,
      timestamp: now,
    },
    { upsert: true }
  );
}

/**
 * Calculate aggregate sentiment
 */
async function calculateAggregateSentiment(symbol, hours = 72) {
  try {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const sentiments = await SentimentModel.find({
      symbol,
      timestamp: { $gte: cutoffTime },
    }).sort({ timestamp: -1 });

    if (sentiments.length === 0) {
      return {
        avgSentiment: 0,
        avgConfidence: 0,
        totalMentions: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        sentimentTrend: 'neutral',
        dataAvailable: false,
        sourceBreakdown: {},
      };
    }

    const totalSentiment = sentiments.reduce((sum, s) => sum + (s.sentimentScore || 0), 0);
    const avgSentiment = totalSentiment / sentiments.length;
    const avgConfidence = sentiments.reduce((sum, s) => sum + (s.confidence || 0.5), 0) / sentiments.length;

    const positiveCount = sentiments.filter(s => s.sentimentLabel === 'positive').length;
    const negativeCount = sentiments.filter(s => s.sentimentLabel === 'negative').length;
    const neutralCount = sentiments.filter(s => s.sentimentLabel === 'neutral').length;

    const sourceBreakdown = sentiments.reduce((acc, s) => {
      const key = s.sourceType || 'news';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const avgFreshness = sentiments.reduce((sum, s) => sum + (s.dataFreshnessMinutes || 60), 0) / sentiments.length;
    const latestSignals = sentiments
      .filter(s => Array.isArray(s.signals))
      .flatMap(s => s.signals)
      .slice(0, 8);

    const aggregate = {
      avgSentiment: parseFloat(avgSentiment.toFixed(4)),
      avgConfidence: parseFloat(avgConfidence.toFixed(3)),
      totalMentions: sentiments.length,
      positiveCount,
      negativeCount,
      neutralCount,
      sentimentTrend: determineTrend(avgSentiment),
      dataAvailable: true,
      positivePercentage: Math.round((positiveCount / sentiments.length) * 100),
      negativePercentage: Math.round((negativeCount / sentiments.length) * 100),
      neutralPercentage: Math.round((neutralCount / sentiments.length) * 100),
      sourceBreakdown,
      freshnessMinutes: Math.round(avgFreshness),
      latestSignals,
    };

    await recordAggregateSnapshot(symbol, aggregate);
    return aggregate;
  } catch (error) {
    console.error(`Error calculating aggregate sentiment for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get sentiment history
 */
async function getSentimentHistory(symbol, days = 7) {
  try {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const history = await SentimentAggregate.find({
      symbol,
      date: { $gte: cutoffDate },
    }).sort({ date: 1, hour: 1 });

    return history.map(entry => ({
      timestamp: new Date(entry.date.getTime() + entry.hour * 60 * 60 * 1000),
      date: entry.date,
      hour: entry.hour,
      sentiment: entry.avgSentiment,
      mentions: entry.totalMentions,
      avgConfidence: entry.avgConfidence,
      positive: entry.positive,
      negative: entry.negative,
      neutral: entry.neutral,
      sourceBreakdown: entry.sourceBreakdown,
      trend: entry.trend,
    }));
  } catch (error) {
    console.error(`Error getting sentiment history for ${symbol}:`, error);
    return [];
  }
}

/**
 * Background job to analyze sentiment
 */
async function startSentimentAnalysis(wss) {
  console.log('🧠 Starting sentiment analysis service...');

  setTimeout(() => analyzeAllStocks(wss), 5000);

  setInterval(async () => {
    const aggregates = await analyzeAllStocks(wss);

    if (wss) {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'sentiment_update',
            data: aggregates,
            timestamp: new Date(),
          }));
        }
      });
    }
  }, 15 * 60 * 1000);
}

/**
 * Analyze all stocks
 */
async function analyzeAllStocks(wss) {
  console.log('🔍 Analyzing sentiment for all stocks...');

  const stocks = getAllStocksList();
  const aggregates = [];

  for (const stock of stocks) {
    try {
      await processNewsSentiment(stock.symbol, stock.name);
      const aggregate = await calculateAggregateSentiment(stock.symbol, 72);
      if (aggregate) {
        aggregates.push({ symbol: stock.symbol, name: stock.name, ...aggregate });
        // Evaluate user configured alerts
        await evaluateAlertsForSymbol(stock.symbol, aggregate);

        // Basic sudden-change alerting through websocket
        try {
          // get previous aggregate snapshot
          const prev = await SentimentAggregate.findOne({ symbol: stock.symbol }).sort({ date: -1, hour: -1 }).exec();
          const prevAvg = prev ? prev.avgSentiment : 0;
          const delta = Math.abs(aggregate.avgSentiment - prevAvg);
          const isSudden = delta >= 0.4 || Math.abs(aggregate.avgSentiment) >= 0.5;
          if (isSudden && wss) {
            const alert = {
              type: 'sudden_sentiment_change',
              symbol: stock.symbol,
              delta: parseFloat(delta.toFixed(4)),
              prevAvg: parseFloat(prevAvg.toFixed(4)),
              currentAvg: aggregate.avgSentiment,
              trend: aggregate.sentimentTrend,
              timestamp: new Date(),
            };
            broadcastSentimentAlert(wss, stock.symbol, alert);
          }
        } catch (err) {
          console.warn('Error computing sudden sentiment change alert for', stock.symbol, err.message);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error analyzing ${stock.symbol}:`, error.message);
    }
  }

  console.log(`✅ Sentiment analysis complete: ${aggregates.length}/${stocks.length} stocks`);
  return aggregates;
}

/**
 * Get current sentiment for all stocks
 */
async function getAllStockSentiments() {
  const stocks = getAllStocksList();
  const results = [];

  for (const stock of stocks) {
    const aggregate = await calculateAggregateSentiment(stock.symbol, 72);
    if (aggregate) {
      results.push({
        symbol: stock.symbol,
        name: stock.name,
        ...aggregate,
      });
    }
  }

  return results;
}

/**
 * Clean old sentiment data (older than 30 days)
 */
async function cleanOldSentimentData() {
  try {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await SentimentModel.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    console.log(`🗑️  Cleaned ${result.deletedCount} old sentiment records`);
  } catch (error) {
    console.error('Error cleaning old data:', error);
  }
}

setInterval(cleanOldSentimentData, 7 * 24 * 60 * 60 * 1000);

module.exports = {
  processNewsSentiment,
  calculateAggregateSentiment,
  getSentimentHistory,
  startSentimentAnalysis,
  analyzeAllStocks,
  getAllStockSentiments,
  cleanOldSentimentData,
};