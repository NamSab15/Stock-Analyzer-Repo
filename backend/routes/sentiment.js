// backend/routes/sentiment.js
const express = require('express');
const router = express.Router();
const { Sentiment } = require('../models/Stock');
const {
  processNewsSentiment,
  getAllStockSentiments,
  calculateAggregateSentiment,
  getSentimentHistory,
} = require('../services/sentimentService');
const { getCompanyAnalysis, getSectorInsights } = require('../services/companyAnalysisService');

/**
 * GET /api/sentiment/:symbol - Get aggregate sentiment for a stock
 */
router.get('/:symbol', async (req, res) => {
  try {
    let { symbol } = req.params;
    const { hours = 24 } = req.query;
    
    if (!symbol.includes('.')) {
      symbol += '.NS';
    }
    
    const sentiment = await calculateAggregateSentiment(symbol, parseInt(hours));
    
    res.json({
      success: true,
      symbol,
      hours: parseInt(hours),
      data: sentiment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sentiment/:symbol/history - Get sentiment history
 */
router.get('/:symbol/history', async (req, res) => {
  try {
    let { symbol } = req.params;
    const { days = 7 } = req.query;
    
    if (!symbol.includes('.')) {
      symbol += '.NS';
    }
    
    const history = await getSentimentHistory(symbol, parseInt(days));
    
    res.json({
      success: true,
      symbol,
      days: parseInt(days),
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sentiment/:symbol/news - Get news articles with sentiment
 */
router.get('/:symbol/news', async (req, res) => {
  try {
    let { symbol } = req.params;
    const { limit = 20, skip = 0, sourceType, minConfidence } = req.query;
    
    if (!symbol.includes('.')) {
      symbol += '.NS';
    }

    const query = { symbol };
    if (sourceType) {
      const sources = sourceType.split(',').map(s => s.trim());
      query.sourceType = { $in: sources };
    }
    if (minConfidence) {
      const confidenceValue = parseFloat(minConfidence);
      if (!Number.isNaN(confidenceValue)) {
        query.confidence = { $gte: confidenceValue };
      }
    }

    let news = await Sentiment.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    if (news.length === 0 && parseInt(skip) === 0) {
      try {
        await processNewsSentiment(symbol);
        news = await Sentiment.find(query)
          .sort({ timestamp: -1 })
          .limit(parseInt(limit));
      } catch (ingestError) {
        console.warn(`Sentiment news fallback failed for ${symbol}:`, ingestError.message);
      }
    }
    
    res.json({
      success: true,
      symbol,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sentiment/:symbol/analyze - Trigger sentiment analysis
 */
router.post('/:symbol/analyze', async (req, res) => {
  try {
    let { symbol } = req.params;
    if (!symbol.includes('.')) {
      symbol += '.NS';
    }
    
    const sentiments = await processNewsSentiment(symbol);
    const aggregate = await calculateAggregateSentiment(symbol, 24);
    
    res.json({
      success: true,
      symbol,
      analyzed: sentiments.length,
      aggregate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sentiment/all - Get sentiment for all tracked stocks
 */
router.get('/', async (req, res) => {
  try {
    const sentiments = await getAllStockSentiments();
    
    res.json({
      success: true,
      count: sentiments.length,
      data: sentiments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sentiment/:symbol/analysis - Get company-specific trading analysis
 */
router.get('/:symbol/analysis', async (req, res) => {
  try {
    let { symbol } = req.params;
    
    if (!symbol.includes('.')) {
      symbol += '.NS';
    }
    
    const analysis = getCompanyAnalysis(symbol);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: `No analysis available for ${symbol}`,
      });
    }
    
    res.json({
      success: true,
      symbol,
      analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sentiment/sector/:sector - Get sector-wide insights
 */
router.get('/sector/:sector', async (req, res) => {
  try {
    const { sector } = req.params;
    
    const insights = getSectorInsights(sector);
    
    if (!insights) {
      return res.status(404).json({
        success: false,
        error: `No companies found for sector: ${sector}`,
      });
    }
    
    res.json({
      success: true,
      sector,
      insights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
