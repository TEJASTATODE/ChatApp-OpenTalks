const User = require('../models/users');
const { verifyToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');
async function requireAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Please register and login" });
  }

  try {
    const userPayload = verifyToken(token);
    if (!userPayload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch user from DB to confirm validity and get full user details
    const user = await User.findById(userPayload._id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;

    // Logs for debugging
    console.log("✅ Token received:", token);
    console.log("✅ Decoded payload:", userPayload);
    console.log("✅ JWT_SECRET used:", process.env.JWT_SECRET);

    next();
  } catch (err) {
    console.error("❌ JWT verification error:", err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = {
  requireAuth,
};

