const Member = require('../models/Member');
const BorrowRecord = require('../models/BorrowRecord');

/**
 * @desc    Register a new member
 * @route   POST /api/members
 * @access  Protected (Librarian)
 */
const registerMember = async (req, res, next) => {
  try {
    const { name, email, membershipId, joinedDate } = req.body;

    const member = await Member.create({
      name,
      email,
      membershipId,
      ...(joinedDate && { joinedDate }),
    });

    return res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List a member's full borrow history
 * @route   GET /api/members/:id/history
 * @access  Public
 */
const getMemberHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const history = await BorrowRecord.find({ member: id })
      .populate('book', 'title author ISBN genre totalCopies availableCopies')
      .sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
        membershipId: member.membershipId,
        joinedDate: member.joinedDate,
      },
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerMember,
  getMemberHistory,
};
