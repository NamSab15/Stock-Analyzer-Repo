const express = require('express');
const AlertRule = require('../models/AlertRule');
const AlertEvent = require('../models/AlertEvent');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const rules = await AlertRule.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const rule = await AlertRule.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const rule = await AlertRule.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Alert rule not found' });
    }

    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const rule = await AlertRule.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Alert rule not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/events/recent', async (req, res) => {
  try {
    const events = await AlertEvent.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
