const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const subscriptionController = require('../controllers/subscriptionController');

// Route to render the plan selection page
router.get('/select-plan', auth, (req, res) => {
    res.render('select-plan', { user: req.user });
});

router.post('/create-subscription', auth, subscriptionController.createSubscription);
router.post('/payment-success', auth, subscriptionController.handlePaymentSuccess);

router.get('/success',auth , async (req, res) => {
    res.render('success', {
        user: req.user,
        plan: req.query.plan,
        razorpay_subscription_id: req.query.razorpay_subscription_id,
        razorpay_payment_id: req.query.razorpay_payment_id
    });
})

module.exports = router;    