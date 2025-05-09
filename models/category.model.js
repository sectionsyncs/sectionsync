const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true // e.g. "Product", "Blog"
  }
}, { timestamps: true });

module.exports = mongoose.model('category', collectionSchema);