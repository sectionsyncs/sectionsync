const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        require: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [13, 'Username must be at least 13 characters long']
    },
    password: {
        type: String,
        require: true,
        trim: true,
        minlength: [5, 'Username must be at least 5 characters long']
    },
    plan: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ['monthly', 'yearly'],
    },
    plan_status: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: Date.now,
    },
    subscriptionId: {
        type: String,
        trim: true,
        default: ''
    },
    paymentId: {
      type: String,
      trim: true,
      default: ''
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    email_verified: { type: Boolean, default: false },
    email_verification_token: {
      type: String,
      trim: true,
      default: ''
    }
});

const user = mongoose.model('user', userSchema);
module.exports = user;