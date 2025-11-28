const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const AlertRule = require('../models/AlertRule');
const AlertEvent = require('../models/AlertEvent');
const User = require('../models/User');
const { evaluateAlertsForSymbol } = require('../services/alertService');

jest.setTimeout(30000);

// Mock the mailer module so we don't attempt real SMTP
jest.mock('../services/mailer', () => {
  return jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test' }))
  }));
});

describe('AlertService', () => {
  let mongo;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  afterEach(async () => {
    await AlertRule.deleteMany({});
    await AlertEvent.deleteMany({});
    await User.deleteMany({});
  });

  test('should send email when rule triggered', async () => {
    const user = await User.create({ name: 'Test User', email: 'test@example.com', password: 'password' });
    const rule = await AlertRule.create({
      userId: user._id,
      name: 'Test Sentiment Email',
      symbol: 'TEST.NS',
      condition: { metric: 'sentiment', operator: 'lt', threshold: -0.1, minMentions: 1 },
      channel: { type: 'email', destination: user.email },
    });

    const aggregate = { avgSentiment: -0.3, totalMentions: 5 };

    await evaluateAlertsForSymbol('TEST.NS', aggregate);

    const events = await AlertEvent.find({ userId: user._id });
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].status).toBe('sent');
  });

  test('should create webhook event when a webhook is configured', async () => {
    // mock axios
    const axios = require('axios');
    jest.spyOn(axios, 'post').mockImplementation(() => Promise.resolve({ status: 200 }));

    const user = await User.create({ name: 'Webhook User', email: 'webhook@example.com', password: 'password' });
    const rule = await AlertRule.create({
      userId: user._id,
      name: 'Webhook Alert',
      symbol: 'TEST.NS',
      condition: { metric: 'sentiment', operator: 'lt', threshold: -0.1, minMentions: 1 },
      channel: { type: 'webhook', destination: 'https://example.local/alert' },
    });

    const aggregate = { avgSentiment: -0.3, totalMentions: 5 };
    await evaluateAlertsForSymbol('TEST.NS', aggregate);

    const events = await AlertEvent.find({ userId: user._id });
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].status).toBe('sent');

    axios.post.mockRestore();
  });
});
