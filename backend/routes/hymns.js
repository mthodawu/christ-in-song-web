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

// GET /hymns/:language/:id - Get a specific hymn by language and ID
router.get('/:language/:id', async (req, res) => {
  try {
    const language = req.params.language.toLowerCase();
    const [, hymnNumber] = req.params.id.split('-');
    
    const HymnModel = getModelForLanguage(language);
    const hymn = await HymnModel.findOne({ number: Number(hymnNumber) });
    
    if (!hymn) {
      return res.status(404).json({ 
        message: `Hymn number ${hymnNumber} not found in ${language} hymnal` 
      });
    }
    res.json(hymn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /hymns/search/:language - Search hymns in a specific language
router.get('/search/:language', async (req, res) => {
  try {
    const { query } = req.query;
    const language = req.params.language.toLowerCase();
    const HymnModel = getModelForLanguage(language);
    
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { markdown: { $regex: query, $options: 'i' } },
        { number: isNaN(query) ? null : Number(query) }
      ].filter(condition => condition.number !== null || condition)
    };

    const hymns = await HymnModel.find(searchQuery).sort({ number: 1 });
    res.json(hymns.map(hymn => ({ ...hymn.toObject(), language })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;