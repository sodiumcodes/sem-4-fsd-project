const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member reference is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: [true, 'Issue date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['issued', 'returned', 'overdue'],
        message: '{VALUE} is not a valid status. Allowed values: issued, returned, overdue',
      },
      default: 'issued',
      required: [true, 'Status is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for querying member borrow history and status
borrowRecordSchema.index({ member: 1 });
borrowRecordSchema.index({ book: 1 });
borrowRecordSchema.index({ status: 1 });

const BorrowRecord = mongoose.model('BorrowRecord', borrowRecordSchema);

module.exports = BorrowRecord;
