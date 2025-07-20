const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    genre: { type: String },
    description: { type: String, maxlength: 1024 },
    coverUrl: { type: String },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
