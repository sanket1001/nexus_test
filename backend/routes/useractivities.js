const express = require('express');
const router = express.Router();

// Get academic levels
router.get('/academic-level/', async (req, res) => {
  try {
    const academicLevels = [
      { id: 1, name: 'Freshman', value: 'freshman' },
      { id: 2, name: 'Sophomore', value: 'sophomore' },
      { id: 3, name: 'Junior', value: 'junior' },
      { id: 4, name: 'Senior', value: 'senior' },
      { id: 5, name: 'Graduate', value: 'graduate' },
      { id: 6, name: 'PhD', value: 'phd' }
    ];

    res.json(academicLevels);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Get majors
router.get('/major/', async (req, res) => {
  try {
    const majors = [
      { id: 1, name: 'Computer Science', value: 'computer-science' },
      { id: 2, name: 'Business Administration', value: 'business-administration' },
      { id: 3, name: 'Engineering', value: 'engineering' },
      { id: 4, name: 'Biology', value: 'biology' },
      { id: 5, name: 'Psychology', value: 'psychology' },
      { id: 6, name: 'Mathematics', value: 'mathematics' },
      { id: 7, name: 'English', value: 'english' },
      { id: 8, name: 'History', value: 'history' },
      { id: 9, name: 'Art', value: 'art' },
      { id: 10, name: 'Music', value: 'music' },
      { id: 11, name: 'Physics', value: 'physics' },
      { id: 12, name: 'Chemistry', value: 'chemistry' },
      { id: 13, name: 'Economics', value: 'economics' },
      { id: 14, name: 'Political Science', value: 'political-science' },
      { id: 15, name: 'Sociology', value: 'sociology' }
    ];

    res.json(majors);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
