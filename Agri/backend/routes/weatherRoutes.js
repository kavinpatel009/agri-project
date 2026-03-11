const express = require('express');
const router = express.Router();
const axios = require('axios');
const Location = require('../models/location');
const verifyToken = require('../middleware/authMiddleware');

// Get weather for a location
router.get('/weather', async (req, res) => {
  try {
    const { q, lat, lon } = req.query;
    let url;
    if (q) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    } else {
      return res.status(400).json({ error: 'Please provide either city name or coordinates' });
    }
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get forecast
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'Please provide coordinates' });
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// ✅ NEW: News proxy route — GNews API
router.get('/news', async (req, res) => {
  try {
    const query = req.query.q || 'agriculture India farming';
    const page = req.query.page || 1;
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=8&page=${page}&token=${process.env.GNEWS_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('News API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get saved locations (login required)
router.get('/locations', verifyToken, async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.userId });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved locations' });
  }
});

// Save a location (login required)
router.post('/locations', verifyToken, async (req, res) => {
  try {
    const { name, country, lat, lon } = req.body;
    const existingLocation = await Location.findOne({ userId: req.userId, lat, lon });
    if (existingLocation) return res.status(400).json({ error: 'Location already saved' });
    const location = new Location({ userId: req.userId, name, country, lat, lon });
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save location' });
  }
});

// Delete a saved location (login required)
router.delete('/locations/:id', verifyToken, async (req, res) => {
  try {
    const location = await Location.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

module.exports = router;
