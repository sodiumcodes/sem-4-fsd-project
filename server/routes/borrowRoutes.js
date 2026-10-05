const express = require('express');
const router = express.Router();
const { borrowBook, returnBook } = require('../controllers/borrowController');
const auth = require('../middleware/auth');
const {
  validate,
  borrowBookSchema,
  returnBookParamsSchema,
} = require('../middleware/validators');

// POST /api/borrow (protected, librarian only)
router.post('/borrow', auth, validate(borrowBookSchema, 'body'), borrowBook);

// POST /api/return/:borrowId (protected, librarian only)
router.post(
  '/return/:borrowId',
  auth,
  validate(returnBookParamsSchema, 'params'),
  returnBook
);

module.exports = router;
