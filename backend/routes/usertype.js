const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get user type
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('userType');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ userType: user.userType });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Update user type (admin only)
router.put('/:userId', auth, async (req, res) => {
  try {
    const { userType } = req.body;

    if (!['student', 'organization', 'admin'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { userType },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
