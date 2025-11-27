const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const { auth } = require('../middleware/auth');

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find({ isActive: true })
      .populate('admins', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json(organizations);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get organization by ID
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('admins', 'firstName lastName email profileImage')
      .populate('members', 'firstName lastName profileImage')
      .populate('followers', 'firstName lastName profileImage');

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Create organization
router.post('/', auth, async (req, res) => {
  try {
    const organization = new Organization({
      ...req.body,
      admins: [req.user.id]
    });

    await organization.save();

    const populatedOrg = await Organization.findById(organization._id)
      .populate('admins', 'firstName lastName email');

    res.status(201).json(populatedOrg);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Update organization
router.put('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is an admin of the organization
    if (!organization.admins.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to update this organization' });
    }

    const updatedOrg = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('admins', 'firstName lastName email');

    res.json(updatedOrg);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Delete organization
router.delete('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is an admin of the organization
    if (!organization.admins.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this organization' });
    }

    await Organization.findByIdAndDelete(req.params.id);

    res.json({ message: 'Organization deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Follow organization
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (organization.followers.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already following this organization' });
    }

    organization.followers.push(req.user.id);
    await organization.save();

    res.json(organization);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Unfollow organization
router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    organization.followers = organization.followers.filter(
      followerId => followerId.toString() !== req.user.id
    );
    await organization.save();

    res.json(organization);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
