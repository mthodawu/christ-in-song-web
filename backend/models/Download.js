const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  church: { type: String, required: true },
  contactType: { type: String, enum: ['email', 'phone'], required: true },
  contact: { type: String, required: true },
  version: { type: String, required: true },
  date: { type: Date, default: Date.now },
  ip: String,
  country: String,
  countryCode: String,
  city: String,
  region: String,
  org: String,
  timezone: String,
});

module.exports = mongoose.model('Download', downloadSchema);
