const axios = require('axios');
const AlertRule = require('../models/AlertRule');
const AlertEvent = require('../models/AlertEvent');
const User = require('../models/User');
const makeMailer = require('./mailer');

function evaluateOperator(value, operator, threshold) {
  switch (operator) {
    case 'lt':
      return value < threshold;
    case 'lte':
      return value <= threshold;
    case 'gt':
      return value > threshold;
    case 'gte':
      return value >= threshold;
    case 'crosses_above':
      return value >= threshold;
    case 'crosses_below':
      return value <= threshold;
    default:
      return false;
  }
}

async function dispatchAlert(rule, payload) {
  const event = await AlertEvent.create({
    ruleId: rule._id,
    userId: rule.userId,
    symbol: rule.symbol,
    channel: rule.channel.type,
    summary: payload.summary,
    payload,
  });

  if (rule.channel.type === 'webhook' && rule.channel.destination) {
    try {
      await axios.post(rule.channel.destination, payload, { timeout: 5000 });
      await AlertEvent.findByIdAndUpdate(event._id, { status: 'sent', sentAt: new Date() });
    } catch (error) {
      await AlertEvent.findByIdAndUpdate(event._id, { status: 'failed', error: error.message });
      console.warn('Webhook alert failed:', error.message);
    }
  } else if (rule.channel.type === 'email') {
    // Email using nodemailer (mailer is preconfigured)
    try {
      const transporter = makeMailer();

      // Resolve recipient
      let recipient = rule.channel.destination;
      if (!recipient && rule.userId) {
        const u = await User.findById(rule.userId).select('email');
        if (u && u.email) recipient = u.email;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@indianstocks.local',
        to: recipient,
        subject: `Alert: ${rule.name} - ${rule.symbol}`,
        text: `${payload.summary}\n\nDetails:\n${JSON.stringify(payload.aggregate || payload, null, 2)}`,
        html: `<p>${payload.summary}</p><pre style="font-size:12px">${JSON.stringify(payload.aggregate || payload, null, 2)}</pre>`,
      };

      if (!recipient) {
        await AlertEvent.findByIdAndUpdate(event._id, { status: 'failed', error: 'No recipient for email' });
        console.warn('Email alert failed: no recipient specified');
      } else {
        await transporter.sendMail(mailOptions);
        await AlertEvent.findByIdAndUpdate(event._id, { status: 'sent', sentAt: new Date() });
      }
    } catch (err) {
      await AlertEvent.findByIdAndUpdate(event._id, { status: 'failed', error: err.message });
      console.warn('Email alert failed:', err.message);
    }
  } else {
    // In-app fallback
    await AlertEvent.findByIdAndUpdate(event._id, { status: 'sent', sentAt: new Date() });
  }
}

function buildSentimentPayload(rule, aggregate) {
  return {
    symbol: rule.symbol,
    summary: `Sentiment ${aggregate.avgSentiment.toFixed(2)} crossed ${rule.condition.operator} ${rule.condition.threshold}`,
    aggregate,
    triggeredAt: new Date(),
  };
}

async function evaluateAlertsForSymbol(symbol, aggregate, context = {}) {
  if (!aggregate) return;

  const rules = await AlertRule.find({ symbol, isActive: true });
  if (!rules.length) return;

  for (const rule of rules) {
    if (!rule.condition) continue;
    const value = rule.condition.metric === 'sentiment'
      ? aggregate.avgSentiment
      : context[rule.condition.metric];

    if (typeof value !== 'number') {
      continue;
    }

    const cooldownMs = (rule.preferences?.cooldownMinutes || 60) * 60 * 1000;
    if (rule.lastTriggeredAt && Date.now() - rule.lastTriggeredAt.getTime() < cooldownMs) {
      continue;
    }

    const meetsMinMentions = (aggregate.totalMentions || 0) >= (rule.condition.minMentions || 0);
    if (!meetsMinMentions) {
      continue;
    }

    if (evaluateOperator(value, rule.condition.operator, rule.condition.threshold)) {
      await dispatchAlert(rule, buildSentimentPayload(rule, aggregate));
      rule.lastTriggeredAt = new Date();
      await rule.save();
    }
  }
}

module.exports = {
  evaluateAlertsForSymbol,
};
