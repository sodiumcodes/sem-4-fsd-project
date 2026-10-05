const Book = require('../models/Book');

/**
 * @desc    Add a new book
 * @route   POST /api/books
 * @access  Protected (Librarian)
 */
const addBook = async (req, res, next) => {
  try {
    const { title, author, ISBN, genre, totalCopies } = req.body;
    let { availableCopies } = req.body;

    // Default availableCopies to totalCopies if not explicitly provided
    if (availableCopies === undefined || availableCopies === null) {
      availableCopies = totalCopies;
    }

    if (availableCopies > totalCopies) {
      return res.status(400).json({
        success: false,
        message: 'Available copies cannot be greater than total copies',
      });
    }

    const book = await Book.create({
      title,
      author,
      ISBN,
      genre,
      totalCopies,
      availableCopies,
    });

    return res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List books with pagination and filtering by genre
 * @route   GET /api/books
 * @access  Public
 */
const getBooks = async (req, res, next) => {
  try {
    const { genre } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (genre) {
      filter.genre = { $regex: new RegExp(`^${genre.trim()}$`, 'i') };
    }

    const [books, total] = await Promise.all([
      Book.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Book.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      count: books.length,
      total,
      page,
      totalPages,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBook,
  getBooks,
};
