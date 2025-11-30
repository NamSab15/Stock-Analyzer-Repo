const express = require('express');
const mongoose = require('mongoose');
const { getClientCount } = require('../utils/websocket');

const router = express.Router();

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting
  res.json({
    success: true,
    data: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
      mongodbState: dbState,
      websocketClients: getClientCount(),
    }
  });
});

module.exports = router;
