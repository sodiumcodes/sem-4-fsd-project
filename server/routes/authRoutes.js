const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { validate, loginSchema } = require('../middleware/validators');

// POST /api/auth/login
router.post('/login', validate(loginSchema, 'body'), login);

module.exports = router;
