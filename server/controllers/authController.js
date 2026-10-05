const jwt = require('jsonwebtoken');

/**
 * @desc    Librarian login & JWT issuance
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const librarianEmail = process.env.LIBRARIAN_EMAIL || 'librarian@shelflife.edu';
    const librarianPassword = process.env.LIBRARIAN_PASSWORD || 'Librarian@123';

    // Verify librarian credentials from environment
    if (email !== librarianEmail || password !== librarianPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const secret = process.env.JWT_SECRET || 'shelflife_default_jwt_secret_key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        email: librarianEmail,
        role: 'librarian',
      },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};
