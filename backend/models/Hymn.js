const mongoose = require('mongoose');

const hymnSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  number: {
    type: Number,
    required: true
  },
  title: {
    type: String,
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
  return mongoose.models[modelName] || mongoose.model(modelName, hymnSchema);
};

module.exports = { hymnSchema, getModelForLanguage };