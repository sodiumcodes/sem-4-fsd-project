const Book = require('../models/Book');
const Member = require('../models/Member');
const BorrowRecord = require('../models/BorrowRecord');

// RACE CONDITION PREVENTION EXPLANATION:
// 1. Avoid separate read-then-write checks (e.g. if copies > 0 then save) because concurrent requests can interleave.
// 2. Instead, use an atomic conditional update: Book.findOneAndUpdate({ _id: id, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } }).
// 3. MongoDB executes document-level updates atomically under internal write locks, serializing simultaneous attempts.
// 4. If two librarians issue the last copy simultaneously, only the first request matches the query; the second receives null.
// 5. This guarantees availableCopies never drops below 0 and eliminates race conditions without distributed locks.

/**
 * @desc    Issue a book to a member
 * @route   POST /api/borrow
 * @access  Protected (Librarian)
 */
const borrowBook = async (req, res, next) => {
  try {
    const bookId = req.body.bookId || req.body.book;
    const memberId = req.body.memberId || req.body.member;
    const { dueDate } = req.body;

    // Verify member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // Atomic conditional decrement to eliminate race condition
    const updatedBook = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      // Determine if book does not exist or has no copies available
      const bookExists = await Book.findById(bookId);
      if (!bookExists) {
        return res.status(404).json({
          success: false,
          message: 'Book not found',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'No available copies left for this book',
      });
    }

    // Create the borrow record
    let borrowRecord;
    try {
      borrowRecord = await BorrowRecord.create({
        book: bookId,
        member: memberId,
        issueDate: new Date(),
        dueDate,
        status: 'issued',
      });
    } catch (createError) {
      // Compensation rollback in case record creation fails
      await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } });
      throw createError;
    }

    return res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: borrowRecord,
      bookAvailableCopies: updatedBook.availableCopies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Return a book
 * @route   POST /api/return/:borrowId
 * @access  Protected (Librarian)
 */
const returnBook = async (req, res, next) => {
  try {
    const { borrowId } = req.params;

    const borrowRecord = await BorrowRecord.findById(borrowId);
    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found',
      });
    }

    if (borrowRecord.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Book has already been returned',
      });
    }

    // Increment availableCopies of the returned book
    const updatedBook = await Book.findByIdAndUpdate(
      borrowRecord.book,
      { $inc: { availableCopies: 1 } },
      { new: true }
    );

    // Update borrow record details
    borrowRecord.returnDate = new Date();
    borrowRecord.status = 'returned';
    await borrowRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: borrowRecord,
      bookAvailableCopies: updatedBook ? updatedBook.availableCopies : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBook,
  returnBook,
};
