const mongoose = require('mongoose');

const hymnSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Generate id using language-number format
      return `${this.constructor.modelName.toLowerCase()}-${this.number}`;
    }
  },
  title: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  markdown: {
    type: String,
    required: true
  }
});

// Create indexes for better search performance
hymnSchema.index({ title: 'text', markdown: 'text' });
hymnSchema.index({ number: 1 });

// Function to get model for a specific language
const getModelForLanguage = (language) => {
  const modelName = `${language}`;
  return mongoose.models[modelName] || mongoose.model(modelName, hymnSchema, language);
};

module.exports = { hymnSchema, getModelForLanguage };