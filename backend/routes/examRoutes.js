const express = require('express');
const {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  getAssignedExams,
  assignExamToStudents,
  removeExamFromStudents,
  getExamStatistics,
  generateExamCode,
  scheduleExam,
  startExam,
  endExam,
  validateExamAccess,
} = require('../controllers/examController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { validateExam } = require('../middlewares/validators');

const router = express.Router();

// Student routes
router.get('/assigned', auth, getAssignedExams);
router.post('/validate-access', auth, authorize('student'), validateExamAccess);

// Admin routes
router.get('/', auth, authorize('admin'), getAllExams);
router.post('/', auth, authorize('admin'), validateExam, createExam);
router.get('/:id', auth, getExamById);
router.put('/:id', auth, authorize('admin'), validateExam, updateExam);
router.delete('/:id', auth, authorize('admin'), deleteExam);
router.post('/:id/assign-students', auth, authorize('admin'), assignExamToStudents);
router.post('/:id/remove-students', auth, authorize('admin'), removeExamFromStudents);
router.get('/:id/statistics', auth, authorize('admin'), getExamStatistics);
router.post('/:id/schedule', auth, authorize('admin'), scheduleExam);
router.post('/:id/generate-code', auth, authorize('admin'), generateExamCode);
router.post('/:id/start', auth, authorize('admin'), startExam);
router.post('/:id/end', auth, authorize('admin'), endExam);

module.exports = router;
