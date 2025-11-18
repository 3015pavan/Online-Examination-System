const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Get all students
exports.getAllStudents = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student' }).select('-password');

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

// Get student by ID
exports.getStudentById = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id).select('-password');

  if (!student || student.role !== 'student') {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

// Create student
exports.createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, registrationNumber, department, semester } = req.body;

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ success: false, message: 'Email already in use' });
  }

  user = await User.findOne({ registrationNumber });
  if (user) {
    return res.status(400).json({ success: false, message: 'Registration number already exists' });
  }

  user = new User({
    name,
    email,
    password,
    registrationNumber,
    department,
    semester,
    role: 'student',
  });

  await user.save();

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      registrationNumber: user.registrationNumber,
      department: user.department,
      semester: user.semester,
    },
  });
});

// Update student
exports.updateStudent = asyncHandler(async (req, res) => {
  let student = await User.findById(req.params.id);

  if (!student || student.role !== 'student') {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const { name, email, department, semester, isActive } = req.body;

  // Check if new email is already in use
  if (email && email !== student.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
  }

  student = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, department, semester, isActive },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: student,
  });
});

// Delete student
exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id);

  if (!student || student.role !== 'student') {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully',
  });
});

// Deactivate student
exports.deactivateStudent = asyncHandler(async (req, res) => {
  const student = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!student || student.role !== 'student') {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Student deactivated successfully',
    data: student,
  });
});

// Activate student
exports.activateStudent = asyncHandler(async (req, res) => {
  const student = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  ).select('-password');

  if (!student || student.role !== 'student') {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Student activated successfully',
    data: student,
  });
});
