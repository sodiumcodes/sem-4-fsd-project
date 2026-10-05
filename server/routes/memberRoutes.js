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

// GET /api/members (protected, librarian only)
router.get('/', auth, getMembers);

// POST /api/members (protected, librarian only)
router.post('/', auth, validate(createMemberSchema, 'body'), registerMember);

// GET /api/members/:id/history (protected, librarian only)
router.get(
  '/:id/history',
  auth,
  validate(memberHistoryParamsSchema, 'params'),
  getMemberHistory
);

module.exports = router;
