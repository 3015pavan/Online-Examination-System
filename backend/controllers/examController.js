const Exam = require('../models/Exam');
const Question = require('../models/Question');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Get all exams
exports.getAllExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find()
    .populate('createdBy', 'name email')
    .populate('questions', 'questionText options correctAnswer');

  res.status(200).json({
    success: true,
    count: exams.length,
    data: exams,
  });
});

// Get exam by ID
exports.getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('questions');

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  res.status(200).json({
    success: true,
    data: exam,
  });
});

// Create exam
exports.createExam = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    duration,
    totalMarks,
    perQuestionMarks,
    negativeMarking,
    totalQuestions,
    examDate,
    startTime,
    endTime,
    instructions,
    passingMarks,
    showResultsAfterSubmission,
    allowReviewAfterSubmission,
    assignedTo,
  } = req.body;

  const exam = new Exam({
    title,
    description,
    duration,
    totalMarks,
    perQuestionMarks,
    negativeMarking,
    totalQuestions,
    examDate,
    startTime,
    endTime,
    instructions,
    passingMarks,
    showResultsAfterSubmission,
    allowReviewAfterSubmission,
    createdBy: req.user._id,
    assignedTo: assignedTo || [],
  });

  await exam.save();

  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: exam,
  });
});

// Update exam
exports.updateExam = asyncHandler(async (req, res) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Only allow creator to update
  if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this exam' });
  }

  // Handle assignedTo field separately if provided
  const updateData = { ...req.body };
  if (req.body.assignedTo) {
    updateData.assignedTo = req.body.assignedTo;
  }

  exam = await Exam.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Exam updated successfully',
    data: exam,
  });
});

// Delete exam
exports.deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Only allow creator to delete
  if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this exam' });
  }

  // Delete all questions associated with this exam
  await Question.deleteMany({ examId: req.params.id });

  await Exam.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Exam deleted successfully',
  });
});

// Get exams assigned to student
exports.getAssignedExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({
    assignedTo: req.user._id,
    isActive: true,
  })
    .populate('questions')
    .populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    count: exams.length,
    data: exams,
  });
});

// Assign exam to students
exports.assignExamToStudents = asyncHandler(async (req, res) => {
  const { studentIds } = req.body;
  const examId = req.params.id;

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Add students to assignedTo
  exam.assignedTo = [...new Set([...exam.assignedTo, ...studentIds])];

  await exam.save();

  res.status(200).json({
    success: true,
    message: `Exam assigned to ${studentIds.length} student(s)`,
    data: exam,
  });
});

// Remove exam from students
exports.removeExamFromStudents = asyncHandler(async (req, res) => {
  const { studentIds } = req.body;
  const examId = req.params.id;

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  exam.assignedTo = exam.assignedTo.filter(
    (id) => !studentIds.includes(id.toString())
  );

  await exam.save();

  res.status(200).json({
    success: true,
    message: 'Exam removed from students',
    data: exam,
  });
});

// Get exam statistics
exports.getExamStatistics = asyncHandler(async (req, res) => {
  const examId = req.params.id;
  const StudentExamResponse = require('../models/StudentExamResponse');

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  const responses = await StudentExamResponse.find({ examId }).populate('studentId', 'name registrationNumber');

  const totalAttempted = responses.filter((r) => r.status === 'submitted').length;
  const totalPassed = responses.filter((r) => r.isPassed).length;
  const averageScore =
    totalAttempted > 0
      ? (responses.reduce((sum, r) => sum + (r.totalObtainedMarks || 0), 0) / totalAttempted).toFixed(2)
      : 0;

  const highestScore = responses.length > 0
    ? Math.max(...responses.map((r) => r.totalObtainedMarks || 0))
    : 0;

  res.status(200).json({
    success: true,
    data: {
      examTitle: exam.title,
      totalAssigned: exam.assignedTo.length,
      totalAttempted,
      totalPassed,
      passPercentage: totalAttempted > 0 ? ((totalPassed / totalAttempted) * 100).toFixed(2) : 0,
      averageScore,
      highestScore,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
    },
  });
});
