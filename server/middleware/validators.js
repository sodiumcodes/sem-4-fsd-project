const Joi = require('joi');

// Helper to validate MongoDB ObjectId
const objectIdValidator = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message(`"${helpers.state.path}" must be a valid 24-character hexadecimal ObjectId`);
  }
  return value;
};

// Validation middleware generator
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: details,
      });
    }

    req[property] = value;
    next();
  };
};

// Auth Login Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Book Schemas
const createBookSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Title is required',
  }),
  author: Joi.string().trim().required().messages({
    'any.required': 'Author is required',
  }),
  ISBN: Joi.string().trim().required().messages({
    'any.required': 'ISBN is required',
  }),
  genre: Joi.string().trim().required().messages({
    'any.required': 'Genre is required',
  }),
  totalCopies: Joi.number().integer().min(0).required().messages({
    'number.base': 'Total copies must be a number',
    'number.integer': 'Total copies must be an integer',
    'number.min': 'Total copies cannot be negative',
    'any.required': 'Total copies is required',
  }),
  availableCopies: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Available copies must be a number',
    'number.integer': 'Available copies must be an integer',
    'number.min': 'Available copies cannot be negative',
  }),
});

const getBooksQuerySchema = Joi.object({
  genre: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

// Member Schemas
const createMemberSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().trim().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  membershipId: Joi.string().trim().required().messages({
    'any.required': 'Membership ID is required',
  }),
  joinedDate: Joi.date().iso().optional(),
});

const memberHistoryParamsSchema = Joi.object({
  id: Joi.string().custom(objectIdValidator, 'ObjectId validation').required().messages({
    'any.required': 'Member ID parameter is required',
  }),
});

// Borrow Schemas
const borrowBookSchema = Joi.object({
  bookId: Joi.string().custom(objectIdValidator, 'ObjectId validation').optional(),
  book: Joi.string().custom(objectIdValidator, 'ObjectId validation').optional(),
  memberId: Joi.string().custom(objectIdValidator, 'ObjectId validation').optional(),
  member: Joi.string().custom(objectIdValidator, 'ObjectId validation').optional(),
  dueDate: Joi.date().iso().required().messages({
    'any.required': 'Due date is required',
    'date.format': 'Due date must be a valid ISO date string',
  }),
})
  .or('bookId', 'book')
  .or('memberId', 'member')
  .messages({
    'object.missing': 'Either bookId or book, and either memberId or member must be provided',
  });

// Return Schema
const returnBookParamsSchema = Joi.object({
  borrowId: Joi.string().custom(objectIdValidator, 'ObjectId validation').required().messages({
    'any.required': 'Borrow ID parameter is required',
  }),
});

module.exports = {
  validate,
  loginSchema,
  createBookSchema,
  getBooksQuerySchema,
  createMemberSchema,
  memberHistoryParamsSchema,
  borrowBookSchema,
  returnBookParamsSchema,
};
