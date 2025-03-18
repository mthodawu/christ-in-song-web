const express = require("express");
const router = express.Router();
const { getModelForLanguage } = require("../models/Hymn");
const Change = require("../models/Change");
const mongoose = require("mongoose");
const { createPatch } = require('diff');

// GET /hymns/:language - Get all hymns for a language
router.get("/:language", async (req, res) => {
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
router.get("/:language/:id", async (req, res) => {
  try {
    const language = req.params.language.toLowerCase();
    const [, hymnNumber] = req.params.id.split("-");

    const HymnModel = getModelForLanguage(language);
    const hymn = await HymnModel.findOne({ number: Number(hymnNumber) });

    if (!hymn) {
      return res.status(404).json({
        message: `Hymn number ${hymnNumber} not found in ${language} hymnal`,
      });
    }
    res.json(hymn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /hymns/:language/:id - Update a specific hymn
router.put("/:language/:id", async (req, res) => {
  try {
    const language = req.params.language.toLowerCase();
    const [, hymnNumber] = req.params.id.split("-");
    const { title, markdown } = req.body;

    const HymnModel = getModelForLanguage(language);
    const hymn = await HymnModel.findOne({ number: Number(hymnNumber) });

    if (!hymn) {
      return res.status(404).json({
        message: `Hymn number ${hymnNumber} not found in ${language} hymnal`,
      });
    }

    // Ensure hymn.id is set
    hymn.id = `${language}-${hymnNumber}`;

    // Track changes before updating
    if (title !== hymn.title) {
      const titleDiff = createPatch('title', hymn.title, title);
      await new Change({
        hymnId: hymn.id || `${language}-${hymnNumber}`,
        language,
        fieldChanged: "title",
        oldValue: hymn.title,
        newValue: title,
        difference: titleDiff
      }).save();
      hymn.title = title;
    }

    if (markdown !== hymn.markdown) {
      const markdownDiff = createPatch('content', hymn.markdown, markdown);
      await new Change({
        hymnId: hymn.id,
        language,
        fieldChanged: "markdown",
        oldValue: hymn.markdown,
        newValue: markdown,
        difference: markdownDiff
      }).save();
      hymn.markdown = markdown;
    }

    // Save the updated hymn
    await hymn.save();

    res.json(hymn);
  } catch (error) {
    console.error("Error updating hymn:", error);
    res.status(500).json({ message: error.message });
  }
});

// IMPORTANT: This search route must come after the more specific /:language/:id routes
// GET /hymns/search/:language - Search hymns across all languages

module.exports = router;
