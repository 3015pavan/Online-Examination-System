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

// Generate Exam Code (must be done at least 30 minutes before exam)
exports.generateExamCode = asyncHandler(async (req, res) => {
  const examId = req.params.id;
  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Only creator can generate code
  if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Check if exam is already started or completed
  if (['active', 'completed'].includes(exam.examStatus)) {
    return res.status(400).json({ success: false, message: 'Cannot generate code for active or completed exam' });
  }

  // Check if scheduled time is set
  if (!exam.scheduledStartTime) {
    return res.status(400).json({ success: false, message: 'Please schedule the exam first' });
  }

  // Verify at least 30 minutes before exam
  const now = new Date();
  const timeDiff = exam.scheduledStartTime - now;
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));

  if (minutesDiff < 30) {
    return res.status(400).json({ 
      success: false, 
      message: 'Exam code must be generated at least 30 minutes before scheduled start time' 
    });
  }

  // Generate unique 8-character exam code
  const generateCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  let examCode = generateCode();
  let codeExists = await Exam.findOne({ examCode });
  
  while (codeExists) {
    examCode = generateCode();
    codeExists = await Exam.findOne({ examCode });
  }

  exam.examCode = examCode;
  exam.codeGeneratedAt = new Date();
  exam.examStatus = 'scheduled';
  await exam.save();

  res.status(200).json({
    success: true,
    message: 'Exam code generated successfully',
    data: {
      examCode: exam.examCode,
      examId: exam._id,
      scheduledStartTime: exam.scheduledStartTime,
      minutesUntilStart: minutesDiff,
    },
  });
});

// Schedule Exam
exports.scheduleExam = asyncHandler(async (req, res) => {
  const examId = req.params.id;
  const { scheduledStartTime, scheduledEndTime } = req.body;

  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Only creator can schedule
  if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const startTime = new Date(scheduledStartTime);
  const endTime = scheduledEndTime ? new Date(scheduledEndTime) : null;

  // Validate times
  if (startTime < new Date()) {
    return res.status(400).json({ success: false, message: 'Scheduled start time must be in the future' });
  }

  if (endTime && endTime <= startTime) {
    return res.status(400).json({ success: false, message: 'End time must be after start time' });
  }

  exam.scheduledStartTime = startTime;
  if (endTime) {
    exam.scheduledEndTime = endTime;
  }
  exam.examStatus = 'scheduled';
  await exam.save();

  res.status(200).json({
    success: true,
    message: 'Exam scheduled successfully',
    data: exam,
  });
});

// Start Exam (Teacher/Admin can start manually or it auto-starts at scheduled time)
exports.startExam = asyncHandler(async (req, res) => {
  const examId = req.params.id;
  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Only creator can start
  if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Check if exam code is generated
  if (!exam.examCode) {
    return res.status(400).json({ success: false, message: 'Please generate exam code first' });
  }

  // Check if already active
  if (exam.examStatus === 'active') {
    return res.status(400).json({ success: false, message: 'Exam is already active' });
  }

  // Verify exam is starting at scheduled time or after
  if (exam.scheduledStartTime && new Date() < exam.scheduledStartTime) {
    return res.status(400).json({ 
      success: false, 
      message: 'Cannot start exam before scheduled time' 
    });
  }

  exam.examStatus = 'active';
  exam.actualStartTime = new Date();
  exam.canStudentsJoin = true;
  await exam.save();

  res.status(200).json({
    success: true,
    message: 'Exam started successfully',
    data: exam,
  });
});

// End Exam
exports.endExam = asyncHandler(async (req, res) => {
  const examId = req.params.id;
  const exam = await Exam.findById(examId);

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Only creator can end
  if (exam.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  exam.examStatus = 'completed';
  exam.actualEndTime = new Date();
  exam.canStudentsJoin = false;
  await exam.save();

  res.status(200).json({
    success: true,
    message: 'Exam ended successfully',
    data: exam,
  });
});

// Validate Exam Access by Code (for students)
exports.validateExamAccess = asyncHandler(async (req, res) => {
  const { examCode } = req.body;
  const studentId = req.user._id;

  const exam = await Exam.findOne({ examCode })
    .populate('questions')
    .populate('createdBy', 'name email');

  if (!exam) {
    return res.status(404).json({ success: false, message: 'Invalid exam code' });
  }

  // Check if student is assigned to this exam
  if (!exam.assignedTo.includes(studentId)) {
    return res.status(403).json({ success: false, message: 'You are not assigned to this exam' });
  }

  // Check if student's examiner matches exam creator
  const student = await User.findById(studentId);
  if (student.examinerId && student.examinerId.toString() !== exam.createdBy._id.toString()) {
    return res.status(403).json({ success: false, message: 'This exam is not from your examiner' });
  }

  // Check if exam is active
  if (exam.examStatus !== 'active') {
    return res.status(400).json({ 
      success: false, 
      message: 'Exam is not active yet. Please wait for the teacher to start it.' 
    });
  }

  // Check if students can join
  if (!exam.canStudentsJoin) {
    return res.status(400).json({ success: false, message: 'Students cannot join at this time' });
  }

  res.status(200).json({
    success: true,
    message: 'Access granted',
    data: {
      exam: {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        totalQuestions: exam.totalQuestions,
        instructions: exam.instructions,
      },
    },
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
