const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { auth } = require('../middleware/auth');

// Get rooms by building ID
router.get('/', async (req, res) => {
  try {
    const { BID } = req.query;

    if (!BID) {
      return res.status(400).json({ error: 'Building ID is required' });
    }

    const rooms = await Room.find({ building: BID })
      .populate('building', 'name code')
      .sort({ floor: 1, roomNumber: 1 });

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('building', 'name code address');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Create room
router.post('/', auth, async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();

    const populatedRoom = await Room.findById(room._id).populate('building', 'name code');

    res.status(201).json(populatedRoom);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Update room
router.put('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('building', 'name code');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Delete room
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
