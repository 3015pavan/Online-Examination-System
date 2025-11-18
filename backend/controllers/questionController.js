const Question = require('../models/Question');
const Exam = require('../models/Exam');
const asyncHandler = require('../utils/asyncHandler');

// Get all questions for an exam
exports.getQuestionsByExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const questions = await Question.find({ examId })
    .sort({ questionNumber: 1 });

  if (!questions || questions.length === 0) {
    return res.status(404).json({ success: false, message: 'No questions found for this exam' });
  }

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
});

// Get question by ID
exports.getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

  res.status(200).json({
    success: true,
    data: question,
  });
});

// Create question
exports.createQuestion = asyncHandler(async (req, res) => {
  const { examId, questionText, questionType, options, correctAnswer, explanation, marks, negativeMarks, difficulty } = req.body;

  // Verify exam exists
  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  // Auto-generate question number
  const lastQuestion = await Question.findOne({ examId }).sort({ questionNumber: -1 });
  const questionNumber = (lastQuestion?.questionNumber || 0) + 1;

  const question = new Question({
    examId,
    questionText,
    questionType,
    options,
    correctAnswer,
    explanation,
    marks: marks || exam.perQuestionMarks,
    negativeMarks: negativeMarks || exam.negativeMarking,
    difficulty,
    questionNumber,
  });

  await question.save();

  // Add question to exam
  if (!exam.questions.includes(question._id)) {
    exam.questions.push(question._id);
    await exam.save();
  }

  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    data: question,
  });
});

// Update question
exports.updateQuestion = asyncHandler(async (req, res) => {
  let question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

  question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    data: question,
  });
});

// Delete question
exports.deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

  const examId = question.examId;

  // Remove question from exam
  await Exam.findByIdAndUpdate(
    examId,
    { $pull: { questions: req.params.id } },
    { new: true }
  );

  await Question.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully',
  });
});

// Bulk create questions
exports.bulkCreateQuestions = asyncHandler(async (req, res) => {
  const { examId, questions: questionsData } = req.body;

  // Verify exam exists
  const exam = await Exam.findById(examId);
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found' });
  }

  const createdQuestions = [];
  let questionNumber = (await Question.findOne({ examId }).sort({ questionNumber: -1 }))?.questionNumber || 0;

  for (const questionData of questionsData) {
    const question = new Question({
      ...questionData,
      examId,
      questionNumber: ++questionNumber,
    });

    await question.save();
    createdQuestions.push(question);
    exam.questions.push(question._id);
  }

  await exam.save();

  res.status(201).json({
    success: true,
    message: `${createdQuestions.length} questions created successfully`,
    count: createdQuestions.length,
    data: createdQuestions,
  });
});

// Get question without correct answer (for student)
exports.getQuestionForStudent = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    return res.status(404).json({ success: false, message: 'Question not found' });
  }

  // Remove correct answer from response
  const questionData = question.toObject();
  delete questionData.correctAnswer;
  delete questionData.explanation;

  res.status(200).json({
    success: true,
    data: questionData,
  });
});
