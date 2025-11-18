const express = require('express');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  deactivateStudent,
  activateStudent,
} = require('../controllers/studentController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const { validateRegister } = require('../middlewares/validators');

const router = express.Router();

// All student routes require admin authentication
router.use(auth, authorize('admin'));

router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.post('/', validateRegister, createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.patch('/:id/deactivate', deactivateStudent);
router.patch('/:id/activate', activateStudent);

module.exports = router;
