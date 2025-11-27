const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organization', 'name logo')
      .populate('createdBy', 'firstName lastName profileImage')
      .sort({ eventDate: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organization', 'name logo description')
      .populate('createdBy', 'firstName lastName profileImage')
      .populate('attendees', 'firstName lastName profileImage')
      .populate('interested', 'firstName lastName profileImage');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Create event
router.post('/', auth, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user.id
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organization', 'name logo')
      .populate('createdBy', 'firstName lastName profileImage');

    res.status(201).json(populatedEvent);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or an admin
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('organization', 'name logo')
      .populate('createdBy', 'firstName lastName profileImage');

    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator or an admin
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Attend event
router.post('/:id/attend', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already attending this event' });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Mark as interested
router.post('/:id/interested', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.interested.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already marked as interested' });
    }

    event.interested.push(req.user.id);
    await event.save();

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
