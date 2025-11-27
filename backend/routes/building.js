const express = require('express');
const router = express.Router();
const Building = require('../models/Building');
const { auth } = require('../middleware/auth');

// Get all buildings
router.get('/', async (req, res) => {
  try {
    const buildings = await Building.find().sort({ name: 1 });
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get building by ID
router.get('/:id', async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);

    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    res.json(building);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Create building
router.post('/', auth, async (req, res) => {
  try {
    const building = new Building(req.body);
    await building.save();

    res.status(201).json(building);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Update building
router.put('/:id', auth, async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    res.json(building);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Delete building
router.delete('/:id', auth, async (req, res) => {
  try {
    const building = await Building.findByIdAndDelete(req.params.id);

    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    res.json({ message: 'Building deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
