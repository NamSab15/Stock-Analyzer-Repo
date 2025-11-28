// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const stockRoutes = require('./routes/stocks');
const sentimentRoutes = require('./routes/sentiment');
const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const { initializeWebSocket } = require('./utils/websocket');
const { startSentimentAnalysis } = require('./services/sentimentService');
const { startRealtimePriceUpdates, stopRealtimePriceUpdates } = require('./services/stockService');
const { startPredictionValidationLoop } = require('./services/predictionValidationService');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indian-stock-sentiment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Connected');
  // Start real-time price updates after a short delay
  setTimeout(() => {
    try {
      startRealtimePriceUpdates();
    } catch (error) {
      console.error('❌ Error starting real-time updates:', error.message);
    }
  }, 1000);
})
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.warn('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Routes
app.use('/api/stocks', stockRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Initialize WebSocket
initializeWebSocket(wss);

if (process.env.ENABLE_SENTIMENT_CRON === 'true') {
  startSentimentAnalysis(wss);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready`);
  startPredictionValidationLoop();
});

// Optional static serving of production frontend build
// Enable by setting SERVE_FRONTEND=true and ensure frontend/dist exists
if (process.env.SERVE_FRONTEND === 'true') {
  const path = require('path');
  const distPath = path.join(__dirname, '../frontend/dist');
  const fs = require('fs');
  if (fs.existsSync(distPath)) {
    console.log('📦 Serving frontend production build');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  } else {
    console.warn('⚠️ SERVE_FRONTEND enabled but dist folder missing:', distPath);
  }
}

// Keep server alive if it tries to close
server.on('close', () => {
  console.warn('⚠️ Server closed, restarting...');
  setTimeout(() => {
    server.listen(PORT);
  }, 1000);
});

// Prevent process from exiting on errors
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    stopRealtimePriceUpdates();
    server.close(() => {
      mongoose.disconnect();
      process.exit(0);
    });
  });
}