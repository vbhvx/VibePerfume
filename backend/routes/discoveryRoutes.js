import express from 'express';
import { db } from '../data/db.js';
import { consultAiSommelier } from '../utils/aiSommelier.js';

const router = express.Router();

// Get all brands
router.get('/brands', (req, res) => {
  try {
    const brands = db.getBrands();
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

// Get all fragrance families
router.get('/families', (req, res) => {
  try {
    const families = db.getFragranceFamilies();
    res.json({ success: true, data: families });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

// Get olfactory notes directory with product counts
router.get('/notes', (req, res) => {
  try {
    const notes = db.getNotes();
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

// Scent-Finder Quiz Recommendation Engine
router.post('/scent-finder', (req, res) => {
  try {
    const preferences = req.body || {};
    const recommendations = db.recommendFragrances(preferences);
    res.json({
      success: true,
      message: 'Fragrance recommendations generated based on your olfactory preferences',
      data: recommendations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
});

// AI Fragrance Sommelier Interactive Assistant
router.post('/ai-sommelier', (req, res) => {
  try {
    const { message, conversationHistory, collectedPreferences } = req.body || {};
    const result = consultAiSommelier({ message, conversationHistory, collectedPreferences });
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
