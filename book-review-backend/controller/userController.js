// controllers/userController.js
const User           = require('../models/User');
const jwt            = require('jsonwebtoken');
const bcrypt         = require('bcryptjs');
const { body, validationResult } = require('express-validator'); // NEW
const tsscmp  = require('tsscmp');        // ← NEW

/* ------------------------------------------------------------------ */
/* Utility: sign JWT with extra fields so frontend can read username  */
/* ------------------------------------------------------------------ */
const signToken = (user) =>
  jwt.sign(
    { id: user._id, username: user.username, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

/* ------------------------------------------------------------------ */
/* Validators you’ll mount in routes (see userRoutes.js below)        */
/* ------------------------------------------------------------------ */
exports.validateRegister = [
  body('username').notEmpty().withMessage('Username required'),
  body('email').isEmail().withMessage('Valid e‑mail required'),
  body('password').isLength({ min: 6 }).withMessage('Min 6‑char password'),
];

exports.validateLogin = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

/* ---------------------------- Register ---------------------------- */
exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { username, email, password } = req.body;

    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already registered' });

    const user  = await User.create({ username, email, password }); // pwd hashed in model
    const token = signToken(user);

    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (err) { next(err); }
};

/* ----------------------------- Login ----------------------------- */
exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Timing‑safe comparison
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !tsscmp(passwordMatch, true))
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (err) { next(err); }
};

/* ------------------------- Get Profile --------------------------- */
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

/* ------------------------ Update Profile ------------------------- */
exports.updateUserProfile = async (req, res, next) => {
  // 🔒 Allow only self or admin
  if (req.userId !== req.params.id && !req.isAdmin)
    return res.status(403).json({ message: 'Forbidden' });

  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.bio)      updates.bio      = req.body.bio;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) { next(err); }
};
