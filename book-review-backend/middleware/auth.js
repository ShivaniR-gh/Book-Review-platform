const jwt = require('jsonwebtoken');
require('dotenv').config();            // makes JWT_SECRET available

// Protect — verify JWT and attach userId
exports.protect = (req, res, next) => {
  // 1. Get token from the Authorization header:  "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized, token missing' });

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 3. Attach user id (and role if stored)
    req.userId  = decoded.id;
    req.isAdmin = decoded.isAdmin;     // optional if you embed isAdmin
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid' });
  }
};

// Admin‑only guard
exports.isAdmin = (req, res, next) => {
  if (!req.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
};
