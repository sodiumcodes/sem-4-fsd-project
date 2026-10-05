const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    ISBN: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [0, 'Total copies cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Total copies must be an integer',
      },
    },
    availableCopies: {
      type: Number,
      required: [true, 'Available copies is required'],
      min: [0, 'Available copies cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Available copies must be an integer',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for genre filtering & ISBN lookup
bookSchema.index({ genre: 1 });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
