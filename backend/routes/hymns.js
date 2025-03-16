const express = require('express');
const router = express.Router();
const { getModelForLanguage } = require('../models/Hymn');

// GET /hymns/:language - Get all hymns for a language
router.get('/:language', async (req, res) => {
  try {
    const language = req.params.language.toLowerCase();
    const HymnModel = getModelForLanguage(language);
    const hymns = await HymnModel.find().sort({ number: 1 });
    res.json(hymns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /hymns/search - Search hymns across languages
router.get('/search', async (req, res) => {
  try {
    const { query, language } = req.query;
    const searchLanguage = language.toLowerCase();
    const HymnModel = getModelForLanguage(searchLanguage);
    
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { markdown: { $regex: query, $options: 'i' } },
        { number: isNaN(query) ? null : Number(query) }
      ].filter(condition => condition.number !== null || condition)
    };

    const hymns = await HymnModel.find(searchQuery).sort({ number: 1 });
    res.json(hymns.map(hymn => ({ ...hymn.toObject(), language: searchLanguage })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /hymns/id/:id - Get a specific hymn by ID
router.get('/id/:id', async (req, res) => {
  try {
    const { language } = req.query;
    if (!language) {
      return res.status(400).json({ message: 'Language parameter is required' });
    }
    
    const HymnModel = getModelForLanguage(language.toLowerCase());
    const hymn = await HymnModel.findOne({ id: req.params.id });
    
    if (!hymn) {
      return res.status(404).json({ message: 'Hymn not found' });
    }
    res.json(hymn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /hymns/number/:number - Get a hymn by its number
router.get('/number/:number', async (req, res) => {
  try {
    const { language } = req.query;
    if (!language) {
      return res.status(400).json({ message: 'Language parameter is required' });
    }

    const HymnModel = getModelForLanguage(language.toLowerCase());
    const hymn = await HymnModel.findOne({ number: Number(req.params.number) });

    if (!hymn) {
      return res.status(404).json({ message: 'Hymn not found' });
    }
    res.json(hymn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;