
const mongoose = require('mongoose');

const changeSchema = new mongoose.Schema({
  hymnId: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  fieldChanged: {
    type: String,
    required: true,
    enum: ['title', 'markdown']
  },
  oldValue: {
    type: String,
    required: true
  },
  newValue: {
    type: String,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Change', changeSchema);
