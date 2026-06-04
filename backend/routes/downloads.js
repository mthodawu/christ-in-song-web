const express = require('express');
const router = express.Router();
const Download = require('../models/Download');

router.post('/', async (req, res) => {
  try {
    const { name, church, contactType, contact, version } = req.body;

    // Extract client IP, respecting proxy headers
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
      .split(',')[0]
      .trim();

    // Geo-locate IP (best-effort)
    let geoData = {};
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      if (geoRes.ok) {
        const geo = await geoRes.json();
        geoData = {
          country: geo.country_name,
          countryCode: geo.country_code,
          city: geo.city,
          region: geo.region,
          org: geo.org,
          timezone: geo.timezone,
        };
      }
    } catch (_) {
      // geo lookup is best-effort, do not block the save
    }

    const download = new Download({
      name,
      church,
      contactType,
      contact,
      version,
      ip,
      ...geoData,
    });

    await download.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
