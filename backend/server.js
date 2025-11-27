const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.log('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const userTypeRoutes = require('./routes/usertype');
const buildingRoutes = require('./routes/building');
const roomRoutes = require('./routes/room');
const organizationRoutes = require('./routes/organization');
const eventRoutes = require('./routes/event');
const postRoutes = require('./routes/post');
const userActivitiesRoutes = require('./routes/useractivities');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/usertype', userTypeRoutes);
app.use('/api/building', buildingRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/post', postRoutes);
app.use('/api/userblog', postRoutes);
app.use('/api/adminblogurl', postRoutes);
app.use('/api/useractivities', userActivitiesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
