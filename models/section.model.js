const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String, // URL or file path
    required: true
  },
  video: {
    type: String, // URL or file video path
    default: ''
  },
  assets: [
    {
      key: { type: String, required: true },
      path: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Section', sectionSchema);