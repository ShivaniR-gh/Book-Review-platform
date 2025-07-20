const express = require('express');
const router  = express.Router();
const bookCtl = require('../controller/bookController');

const { protect, isAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');  // ← NEW

// GET /api/books
router.get('/', bookCtl.getBooks);
module.exports = router;

// POST /api/books  (admin + validation)
router.post(
  '/',
  protect, isAdmin,                                        // guards
  [
    body('title').notEmpty().withMessage('Title required'),
    body('author').notEmpty().withMessage('Author required'),
    body('genre').optional().isString(),
    body('averageRating').optional().isFloat({ min: 0, max: 5 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    bookCtl.createBook(req, res, next);
  }
);

// GET /api/books/:id
router.get('/:id', bookCtl.getBookById);

module.exports = router;
