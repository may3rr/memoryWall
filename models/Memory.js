const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  timestamps: true
});

memorySchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

module.exports = mongoose.model('Memory', memorySchema); 