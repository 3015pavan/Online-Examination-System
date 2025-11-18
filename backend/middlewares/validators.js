const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  // Optional role: student or conductor
  body('role').optional().isIn(['student', 'conductor']).withMessage('Role must be student or conductor'),
  // registrationNumber required only for students
  body('registrationNumber').custom((value, { req }) => {
    if ((req.body.role || 'student') === 'student') {
      if (!value || value.trim() === '') {
        throw new Error('Registration number is required for student role');
      }
    }
    return true;
  }),
  validateRequest,
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

const validateExam = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('totalMarks').isInt({ min: 0 }).withMessage('Total marks cannot be negative'),
  body('perQuestionMarks').isInt({ min: 0 }).withMessage('Marks per question cannot be negative'),
  body('totalQuestions').isInt({ min: 1 }).withMessage('At least 1 question is required'),
  body('examDate').isISO8601().withMessage('Please provide a valid exam date'),
  validateRequest,
];

const validateQuestion = [
  body('questionText').trim().notEmpty().withMessage('Question text is required').isLength({ min: 5 }).withMessage('Question must be at least 5 characters'),
  body('options').isArray({ min: 2 }).withMessage('At least 2 options are required'),
  body('correctAnswer').notEmpty().withMessage('Correct answer is required'),
  validateRequest,
];

module.exports = {
  validateRequest,
  validateRegister,
  validateLogin,
  validateExam,
  validateQuestion,
};
