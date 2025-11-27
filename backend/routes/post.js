const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth, isAdmin } = require('../middleware/auth');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ visibility: 'public' })
      .populate('author', 'firstName lastName profileImage userType')
      .populate('organization', 'name logo')
      .populate('comments.user', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get user's posts
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'firstName lastName profileImage')
      .populate('organization', 'name logo')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName profileImage')
      .populate('organization', 'name logo')
      .populate('comments.user', 'firstName lastName profileImage')
      .populate('likes', 'firstName lastName profileImage');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      author: req.user.id
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'firstName lastName profileImage')
      .populate('organization', 'name logo');

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('author', 'firstName lastName profileImage')
      .populate('organization', 'name logo');

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author or an admin
    if (post.author.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Like post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.likes.includes(req.user.id)) {
      // Unlike
      post.likes = post.likes.filter(userId => userId.toString() !== req.user.id);
    } else {
      // Like
      post.likes.push(req.user.id);
    }

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
      user: req.user.id,
      content: req.body.content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'firstName lastName profileImage');

    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Report post
router.post('/:id/report', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.isReported = true;
    post.reportCount += 1;
    await post.save();

    res.json({ message: 'Post reported successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get reported posts (admin only)
router.get('/admin/reported', auth, isAdmin, async (req, res) => {
  try {
    const posts = await Post.find({ isReported: true })
      .populate('author', 'firstName lastName profileImage')
      .sort({ reportCount: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
