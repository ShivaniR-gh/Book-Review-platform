const Review = require('../models/Review');
const Book = require('../models/Book');

// GET /reviews?bookId=xxxx
exports.getReviewsForBook = async (req, res, next) => {
  try {
    const { bookId } = req.query;

    if (!bookId) {
      return res.status(400).json({ error: 'bookId query parameter is required' });
    }

    const reviews = await Review.find({ book: bookId }).populate('user', 'username');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// POST /reviews
exports.createReview = async (req, res, next) => {
  try {
    const { book, rating, comment } = req.body;
    const userId = req.userId;

    if (!book || !rating || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const review = await Review.create({
      book,
      rating,
      comment,
      user: userId
    });

    const agg = await Review.aggregate([
      { $match: { book: review.book } },
      { $group: { _id: '$book', avgRating: { $avg: '$rating' } } }
    ]);

    const avg = agg.length > 0 ? agg[0].avgRating : 0;

    await Book.findByIdAndUpdate(book, { averageRating: avg });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

// ✅ NEW: GET /reviews/user/:userId
exports.getReviewsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const reviews = await Review.find({ user: userId }).populate('book', 'title');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
