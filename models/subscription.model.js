const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subscriptionId: String,
  planType: { type: String, enum: ['monthly', 'yearly'] },
  status: { type: String, default: 'created' }, // 'created', 'active', 'cancelled'
  createdAt: { type: Date, default: Date.now },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;