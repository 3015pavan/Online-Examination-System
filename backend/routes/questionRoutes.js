const express = require('express');
const {
  getQuestionsByExam,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  getQuestionForStudent,
} = require('../controllers/questionController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { validateQuestion } = require('../middlewares/validators');

const router = express.Router();

// Admin routes
router.get('/exam/:examId', auth, authorize('admin'), getQuestionsByExam);
router.post('/', auth, authorize('admin'), validateQuestion, createQuestion);
router.post('/bulk-create', auth, authorize('admin'), bulkCreateQuestions);
router.get('/:id', auth, authorize('admin'), getQuestionById);
router.put('/:id', auth, authorize('admin'), validateQuestion, updateQuestion);
router.delete('/:id', auth, authorize('admin'), deleteQuestion);

// Student route - get question without answer
router.get('/:id/for-student', auth, authorize('student'), getQuestionForStudent);

module.exports = router;
