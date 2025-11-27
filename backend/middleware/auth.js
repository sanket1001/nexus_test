const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('auth-token');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

    if (!verified) {
      return res.status(401).json({ error: 'Token verification failed, authorization denied' });
    }

    req.user = verified;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Invalid token', message: err.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Error verifying admin status', message: err.message });
  }
};

module.exports = { auth, isAdmin };
