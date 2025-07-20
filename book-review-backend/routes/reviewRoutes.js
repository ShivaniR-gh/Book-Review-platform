// routes/reviewRoutes.js

const express = require('express');
const router = express.Router();
const reviewController = require('../controller/ReviewController'); // ✅ Correct path (case-sensitive)
const { protect } = require('../middleware/auth');
const Review = require('../models/Review');

// ROUTES

// Get all reviews for a specific book (assumes bookId is passed as query param or handled inside controller)
router.get("/", reviewController.getReviewsForBook);

// Create a new review (protected route)
router.post("/", protect, reviewController.createReview);

// Get all reviews by a specific user
router.get("/user/:userId", reviewController.getReviewsByUser);

// Delete a review by ID
router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Server error while deleting review" });
  }
});

module.exports = router;
