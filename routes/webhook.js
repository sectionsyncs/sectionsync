// routes/webhook.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/user.model'); // Assuming you have a User model
const dotenv = require("dotenv");
dotenv.config();

const RAZORPAY_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

router.post('/razorpay', express.json({ verify: (req, res, buf) => { req.rawBody = buf } }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const expectedSignature = crypto.createHmac('sha256', RAZORPAY_SECRET)
                                  .update(req.rawBody)
                                  .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.event === 'subscription.charged') {
    const subscriptionId = event.payload.subscription.entity.id;

    try {
      // You need to map subscriptionId to user in your DB  
      const user = await User.findOne({ subscriptionId: subscriptionId });

      if (user && user.plan === 'monthly') {
        // Extend planEndDate by 1 month
        const currentEnd = new Date(user.endDate);
        const newEnd = new Date(currentEnd.setMonth(currentEnd.getMonth() + 1));

        user.endDate = newEnd;
        await user.save();
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).send('Server error');
    }
  }

  return res.status(200).json({ status: 'ignored' });
});

module.exports = router;
