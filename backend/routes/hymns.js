
const express = require('express');
const router = express.Router();
const { getModelForLanguage } = require('../models/Hymn');
const Change = require('../models/Change');

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

// PUT /hymns/:language/:id - Update a specific hymn
router.put('/:language/:id', async (req, res) => {
  try {
    const language = req.params.language.toLowerCase();
    const [, hymnNumber] = req.params.id.split('-');
    const { title, markdown } = req.body;
    
    const HymnModel = getModelForLanguage(language);
    const hymn = await HymnModel.findOne({ number: Number(hymnNumber) });
    
    if (!hymn) {
      return res.status(404).json({ 
        message: `Hymn number ${hymnNumber} not found in ${language} hymnal` 
      });
    }
    
    // Track changes before updating
    if (title !== hymn.title) {
      await new Change({
        hymnId: hymn.id,
        language,
        fieldChanged: 'title',
        oldValue: hymn.title,
        newValue: title
      }).save();
      hymn.title = title;
    }
    
    if (markdown !== hymn.markdown) {
      await new Change({
        hymnId: hymn.id,
        language,
        fieldChanged: 'markdown',
        oldValue: hymn.markdown,
        newValue: markdown
      }).save();
      hymn.markdown = markdown;
    }
    
    // Save the updated hymn
    await hymn.save();
    
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
