const razorpay = require('../config/razorpay');
const User = require('../models/user.model'); 
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

exports.createSubscription = async (req, res) => {
  const { planType } = req.body; // 'monthly' or 'yearly'
  const planId =
    planType === 'monthly'
      ? process.env.RAZORPAY_MONTHLY_PLAN_ID
      : process.env.RAZORPAY_YEARLY_PLAN_ID;

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: planType === 'monthly' ? 12 : 1,
    });

    res.render('checkout', {
      subscriptionId: subscription.id,
      planType,
      user: req.user,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(`Error creating subscription: ${error}`);
    res.status(500).send('Error creating subscription');
  }
};

exports.handlePaymentSuccess = async (req, res) => {
  const { razorpay_subscription_id, razorpay_payment_id, planType } = req.body;

  const userId = req.user.userID;
  const startDate = new Date();
  const endDate = new Date();
  //console.log(req.user)
  //console.log(razorpay_subscription_id, razorpay_payment_id, planType, userId);

  if (planType === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  try {
    const updateUser = await User.findByIdAndUpdate(userId, {
      plan: planType,
      plan_status: 'active',
      startDate,
      endDate,
      subscriptionId: razorpay_subscription_id,
      paymentId: razorpay_payment_id
    });

    console.log(updateUser);

    // Create new token with updated user info
    const token = jwt.sign({
        userID: updateUser._id,
        username: updateUser.username,
        email: updateUser.email,
        plan: updateUser.plan,
        plan_status: updateUser.plan_status,
        startDate: updateUser.startDate,
        endDate: updateUser.endDate,
        email_verified: updateUser.email_verified,
        isAdmin: updateUser.isAdmin
      },
      process.env.JWT_SECRET
    );

    // Send new cookie
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.render('success', {
      user: req.user,
      plan: planType,
      razorpay_subscription_id,
      razorpay_payment_id
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating subscription');
  }
};
