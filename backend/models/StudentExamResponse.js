const mongoose = require('mongoose');

const studentExamResponseSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Please provide exam ID'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide student ID'],
    },
    responses: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        selectedAnswer: String, // A, B, C, D, true, false
        isCorrect: Boolean,
        marksAwarded: Number,
        timeSpent: Number, // in seconds
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    totalObtainedMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'submitted', 'evaluated'],
      default: 'not-started',
    },
    startedAt: Date,
    submittedAt: Date,
    totalTimeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    unattemptedQuestions: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    review: {
      type: String,
      default: '',
    },
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

// Compound index to ensure one response per student per exam
studentExamResponseSchema.index({ examId: 1, studentId: 1 }, { unique: true });

// Method to calculate score
studentExamResponseSchema.methods.calculateScore = async function () {
  const exam = await mongoose.model('Exam').findById(this.examId);
  const questions = await mongoose.model('Question').find({
    _id: { $in: exam.questions },
  });

  let totalMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  this.responses.forEach((response) => {
    const question = questions.find((q) => q._id.toString() === response.questionId.toString());
    if (question) {
      if (response.selectedAnswer === question.correctAnswer) {
        response.isCorrect = true;
        response.marksAwarded = question.marks;
        totalMarks += question.marks;
        correctCount++;
      } else {
        response.isCorrect = false;
        response.marksAwarded = -question.negativeMarks;
        totalMarks -= question.negativeMarks;
        incorrectCount++;
      }
    }
  });

  this.totalObtainedMarks = Math.max(0, totalMarks);
  this.totalScore = exam.totalMarks;
  this.percentage = ((this.totalObtainedMarks / this.totalScore) * 100).toFixed(2);
  this.correctAnswers = correctCount;
  this.incorrectAnswers = incorrectCount;
  this.unattemptedQuestions = exam.totalQuestions - (correctCount + incorrectCount);
  this.isPassed = this.totalObtainedMarks >= (exam.passingMarks || 0);

  return this.save();
};

module.exports = mongoose.model('StudentExamResponse', studentExamResponseSchema);
