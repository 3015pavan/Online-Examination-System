const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Please provide exam ID'],
    },
    questionText: {
      type: String,
      required: [true, 'Please provide question text'],
      minlength: [5, 'Question text must be at least 5 characters long'],
    },
    questionType: {
      type: String,
      enum: ['mcq', 'true-false', 'short-answer'],
      default: 'mcq',
    },
    options: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        optionText: String,
        optionLetter: String, // A, B, C, D
      },
    ],
    correctAnswer: {
      type: String,
      required: [true, 'Please provide the correct answer'],
      enum: ['A', 'B', 'C', 'D', 'true', 'false'],
    },
    explanation: {
      type: String,
      default: '',
    },
    marks: {
      type: Number,
      default: 1,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    questionNumber: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
