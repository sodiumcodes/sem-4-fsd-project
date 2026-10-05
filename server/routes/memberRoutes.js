const express = require('express');
const router = express.Router();
const {
  registerMember,
  getMembers,
  getMemberHistory,
} = require('../controllers/memberController');
const auth = require('../middleware/auth');
const {
  validate,
  createMemberSchema,
  memberHistoryParamsSchema,
} = require('../middleware/validators');

// GET /api/members (public)
router.get('/', getMembers);

// POST /api/members (protected, librarian only)
router.post('/', auth, validate(createMemberSchema, 'body'), registerMember);

// GET /api/members/:id/history (public)
router.get(
  '/:id/history',
  validate(memberHistoryParamsSchema, 'params'),
  getMemberHistory
);

module.exports = router;
