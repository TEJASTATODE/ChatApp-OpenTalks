const { Router } = require('express');
const multer = require('multer');
const User = require('../models/users');
const router = Router();
const upload = multer({ dest: 'uploads/' }); // Assuming you have multer set up for file uploads
const { generateToken } = require('../utils/jwt'); // Assuming you have a JWT utility for token generation
router.post('/register', upload.single('photo'), async (req, res) => {
  const { name, email, password } = req.body;
const photopath = req.file ? req.file.filename : "default.png";

  // Check if the photo was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'Photo is required' });
  }

  // Check for missing fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new User({ name, email, password, avatar: photopath });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // Send the real error message for debugging
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Generate a token (if using JWT, implement token generation here)
    const token = generateToken(user); // Assuming generateToken is imported from utils/jwt.js
    

    res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
