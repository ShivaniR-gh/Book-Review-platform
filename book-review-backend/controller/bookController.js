const Book = require('../models/Book');

// GET /books
exports.getBooks = async (req, res, next) => {
  try {
    const page  = +req.query.page  || 1;
    const limit = +req.query.limit || 10;
    const skip  = (page - 1) * limit;

    // Optional search by title
    const keyword = req.query.q
      ? { title: new RegExp(req.query.q, 'i') }
      : {};

    const books = await Book.find(keyword).skip(skip).limit(limit);
    const total = await Book.countDocuments(keyword);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      books,
    });
  } catch (err) { next(err); }
};

// GET /books/:id
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

// POST /books (admin only)
exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};
