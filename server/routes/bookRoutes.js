const express = require('express');
const router = express.Router();
const { addBook, getBooks } = require('../controllers/bookController');
const auth = require('../middleware/auth');
const {
  validate,
  createBookSchema,
  getBooksQuerySchema,
} = require('../middleware/validators');

// GET /api/books (public, with pagination & genre filter)
router.get('/', validate(getBooksQuerySchema, 'query'), getBooks);

// POST /api/books (protected, librarian only)
router.post('/', auth, validate(createBookSchema, 'body'), addBook);

module.exports = router;
