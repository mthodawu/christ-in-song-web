
const express = require('express');
const router = express.Router();
const { getModelForLanguage } = require('../models/Hymn');
const Change = require('../models/Change');
const mongoose = require('mongoose');

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

    // Ensure hymn.id is set
    hymn.id = `${language}-${hymnNumber}`;

    // Track changes before updating
    if (title !== hymn.title) {
      await new Change({
        hymnId: hymn.id || `${language}-${hymnNumber}`,
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

// IMPORTANT: This search route must come after the more specific /:language/:id routes
// GET /hymns/search/:language - Search hymns across all languages
router.get('/search/:language', async (req, res) => {
  try {
    const { query } = req.query;
    const primaryLanguage = req.params.language.toLowerCase();
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchResults = [];
    
    // Get list of all collections representing languages
    const collections = mongoose.connection.collections;
    const languageCollections = Object.keys(collections).filter(
      name => name !== 'changes' && name !== 'system.indexes'
    );
    
    // Search each language collection, starting with primary language
    // This ensures primary language results come first
    const orderedCollections = [
      primaryLanguage,
      ...languageCollections.filter(lang => lang !== primaryLanguage)
    ];
    
    for (const language of orderedCollections) {
      // Skip collections that aren't properly initialized
      if (!collections[language]) continue;
      
      try {
        const HymnModel = getModelForLanguage(language);
        
        const searchQuery = {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { markdown: { $regex: query, $options: 'i' } }
          ]
        };
        
        // If query is a number, also search by hymn number
        if (!isNaN(Number(query)) && query.trim() !== '') {
          searchQuery.$or.push({ number: Number(query) });
        }

        const languageResults = await HymnModel.find(searchQuery).sort({ number: 1 });
        searchResults.push(...languageResults.map(hymn => ({ 
          ...hymn.toObject(), 
          language 
        })));
      } catch (error) {
        console.error(`Error searching collection ${language}:`, error);
        // Continue with other collections even if one fails
      }
    }
    
    res.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ status: 500, message: error.message });
  }
});

module.exports = router;
