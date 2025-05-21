const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscription.model');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post('/', async (req, res) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const staleSubscriptions = await Subscription.find({
    status: 'created',
    createdAt: { $lt: tenMinutesAgo }
  });
 
  for (const sub of staleSubscriptions) {
    try {
      await razorpay.subscriptions.cancel(sub.subscriptionId);
      sub.status = 'cancelled';
      await sub.save();
    } catch (err) {
      console.error(`Failed to cancel ${sub.subscriptionId}:`, err);
    }
  }

  res.status(200).json({ message: 'Cancelled stale subscriptions', count: staleSubscriptions.length });
});

module.exports = router;