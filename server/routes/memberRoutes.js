const express = require('express');
const router = express.Router();
const {
  registerMember,
  getMemberHistory,
} = require('../controllers/memberController');
const auth = require('../middleware/auth');
const {
  validate,
  createMemberSchema,
  memberHistoryParamsSchema,
} = require('../middleware/validators');

// POST /api/members (protected, librarian only)
router.post('/', auth, validate(createMemberSchema, 'body'), registerMember);

// GET /api/members/:id/history (public)
router.get(
  '/:id/history',
  validate(memberHistoryParamsSchema, 'params'),
  getMemberHistory
);

module.exports = router;
