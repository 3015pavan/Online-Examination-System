const express = require('express');
const {
  startExam,
  saveAnswer,
  submitExam,
  getExamResult,
  getAllResultsForExam,
  getStudentResults,
  exportResultsToCSV,
  getStudentResultDetails,
  getDashboardStatistics,
} = require('../controllers/resultController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// Student routes
router.post('/:examId/start', auth, authorize('student'), startExam);
router.post('/:examId/save-answer', auth, authorize('student'), saveAnswer);
router.post('/:examId/submit', auth, authorize('student'), submitExam);
router.get('/:examId/result', auth, authorize('student'), getExamResult);
router.get('/my-results', auth, authorize('student'), getStudentResults);

// Admin routes
router.get('/exam/:examId/all-results', auth, authorize('admin'), getAllResultsForExam);
router.get('/exam/:examId/export-csv', auth, authorize('admin'), exportResultsToCSV);
router.get('/student/:studentId/:examId', auth, authorize('admin'), getStudentResultDetails);
router.get('/dashboard/statistics', auth, authorize('admin'), getDashboardStatistics);

module.exports = router;
