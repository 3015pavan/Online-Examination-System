const StudentExamResponse = require('../models/StudentExamResponse');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { exportResultsToCSV } = require('../utils/csvExporter');

// Start exam
exports.startExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user._id;

  // Check if exam exists
  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Check if exam is assigned to student
  if (!exam.assignedTo.includes(studentId)) {
    return res.status(403).json({ success: false, message: 'This exam is not assigned to you' });
  }

  // Check if student already started
  let response = await StudentExamResponse.findOne({ examId, studentId });

  if (response && response.status !== 'not-started') {
    return res.status(400).json({ 
      success: false, 
      message: 'You have already started this exam' 
    });
  }

  if (!response) {
    response = new StudentExamResponse({
      examId,
      studentId,
      status: 'in-progress',
      startedAt: new Date(),
    });
  } else {
    response.status = 'in-progress';
    response.startedAt = new Date();
  }

  await response.save();

  res.status(200).json({
    success: true,
    message: 'Exam started',
    data: response,
  });
});

// Save answer
exports.saveAnswer = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { questionId, selectedAnswer } = req.body;
  const studentId = req.user._id;

  // Get or create response
  let response = await StudentExamResponse.findOne({ examId, studentId });

  if (!response) {
    return res.status(404).json({ success: false, message: 'Exam not started' });
  }

  if (response.status === 'submitted') {
    return res.status(400).json({ success: false, message: 'Exam already submitted' });
  }

  // Find or create response for this question
  let questionResponse = response.responses.find(
    (r) => r.questionId.toString() === questionId
  );

  if (!questionResponse) {
    response.responses.push({
      questionId,
      selectedAnswer,
      timeSpent: 0,
    });
  } else {
    questionResponse.selectedAnswer = selectedAnswer;
  }

  await response.save();

  res.status(200).json({
    success: true,
    message: 'Answer saved',
    data: response,
  });
});

// Submit exam
exports.submitExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { totalTimeSpent } = req.body;
  const studentId = req.user._id;

  let response = await StudentExamResponse.findOne({ examId, studentId });

  if (!response) {
    return res.status(404).json({ success: false, message: 'Exam not started' });
  }

  if (response.status === 'submitted') {
    return res.status(400).json({ success: false, message: 'Exam already submitted' });
  }

  response.status = 'submitted';
  response.submittedAt = new Date();
  response.totalTimeSpent = totalTimeSpent || 0;

  // Calculate score
  await response.calculateScore();

  res.status(200).json({
    success: true,
    message: 'Exam submitted successfully',
    data: response,
  });
});

// Get exam result
exports.getExamResult = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const studentId = req.user._id;

  const response = await StudentExamResponse.findOne({ examId, studentId })
    .populate('examId', 'title totalMarks duration')
    .populate({
      path: 'responses.questionId',
      select: 'questionText options correctAnswer explanation',
    });

  if (!response) {
    return res.status(404).json({ success: false, message: 'Result not found' });
  }

  res.status(200).json({
    success: true,
    data: response,
  });
});

// Get all results for exam (Admin)
exports.getAllResultsForExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  const responses = await StudentExamResponse.find({ examId, status: 'submitted' })
    .populate('studentId', 'name email registrationNumber')
    .sort({ submittedAt: -1 });

  // Add student name and registration number to response
  const resultsWithStudentInfo = responses.map((r) => ({
    ...r.toObject(),
    studentName: r.studentId.name,
    email: r.studentId.email,
    registrationNumber: r.studentId.registrationNumber,
  }));

  res.status(200).json({
    success: true,
    count: responses.length,
    data: resultsWithStudentInfo,
  });
});

// Get student's all results
exports.getStudentResults = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const responses = await StudentExamResponse.find({ studentId, status: 'submitted' })
    .populate('examId', 'title totalMarks duration')
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    count: responses.length,
    data: responses,
  });
});

// Export results to CSV
exports.exportResultsToCSV = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  const responses = await StudentExamResponse.find({ examId, status: 'submitted' })
    .populate('studentId', 'name registrationNumber');

  if (responses.length === 0) {
    return res.status(400).json({ success: false, message: 'No results to export' });
  }

  const resultsData = responses.map((r) => ({
    studentName: r.studentId.name,
    registrationNumber: r.studentId.registrationNumber,
    totalObtainedMarks: r.totalObtainedMarks,
    totalScore: r.totalScore,
    percentage: r.percentage,
    correctAnswers: r.correctAnswers,
    incorrectAnswers: r.incorrectAnswers,
    unattemptedQuestions: r.unattemptedQuestions,
    status: r.status,
    submittedAt: r.submittedAt,
  }));

  try {
    const filepath = await exportResultsToCSV(resultsData, exam.title);

    res.download(filepath, `results_${exam.title}.csv`);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error exporting results', error: error.message });
  }
});

// Get student result details
exports.getStudentResultDetails = asyncHandler(async (req, res) => {
  const { examId, studentId } = req.params;

  const response = await StudentExamResponse.findOne({ examId, studentId })
    .populate('examId', 'title totalMarks duration passingMarks')
    .populate({
      path: 'responses.questionId',
      select: 'questionText options correctAnswer explanation marks negativeMarks',
    })
    .populate('studentId', 'name registrationNumber email');

  if (!response) {
    return res.status(404).json({ success: false, message: 'Result not found' });
  }

  // Verify authorization
  if (req.user.role === 'student' && response.studentId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this result' });
  }

  res.status(200).json({
    success: true,
    data: response,
  });
});

// Get statistics for dashboard
exports.getDashboardStatistics = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
  const totalExams = await Exam.countDocuments({ isActive: true });
  const totalResponses = await StudentExamResponse.countDocuments({ status: 'submitted' });

  const responses = await StudentExamResponse.find({ status: 'submitted' })
    .select('totalObtainedMarks totalScore');

  const avgScore = responses.length > 0
    ? (responses.reduce((sum, r) => sum + (r.totalObtainedMarks || 0), 0) / responses.length).toFixed(2)
    : 0;

  const highestScore = responses.length > 0
    ? Math.max(...responses.map((r) => r.totalObtainedMarks || 0))
    : 0;

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      totalExams,
      totalResultsConducted: totalResponses,
      averageScore: avgScore,
      highestScore,
    },
  });
});
