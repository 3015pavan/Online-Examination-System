const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide exam title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please provide exam duration'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Please provide total marks'],
      min: [0, 'Total marks cannot be negative'],
    },
    perQuestionMarks: {
      type: Number,
      required: [true, 'Please provide marks per question'],
      min: [0, 'Marks per question cannot be negative'],
    },
    negativeMarking: {
      type: Number,
      default: 0,
      min: [0, 'Negative marking cannot be negative'],
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Please provide total number of questions'],
      min: [1, 'At least 1 question is required'],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    examDate: {
      type: Date,
      required: [true, 'Please provide exam date'],
    },
    startTime: {
      type: String, // HH:mm format
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String, // HH:mm format
      required: [true, 'Please provide end time'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    instructions: {
      type: String,
      default:
        'Please read all instructions carefully. Do not switch tabs or windows during the exam.',
    },
    negativeMarksPerQuestion: {
      type: Number,
      default: 0,
    },
    passingMarks: {
      type: Number,
      default: 0,
    },
    showResultsAfterSubmission: {
      type: Boolean,
      default: true,
    },
    allowReviewAfterSubmission: {
      type: Boolean,
      default: true,
    },
    examCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    examStatus: {
      type: String,
      enum: ['created', 'scheduled', 'active', 'completed', 'cancelled'],
      default: 'created',
    },
    scheduledStartTime: {
      type: Date,
    },
    scheduledEndTime: {
      type: Date,
    },
    actualStartTime: {
      type: Date,
    },
    actualEndTime: {
      type: Date,
    },
    codeGeneratedAt: {
      type: Date,
    },
    canStudentsJoin: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Middleware to populate questions when fetching exam
examSchema.pre(/^find/, function (next) {
  if (this.options.populate !== false) {
    this.populate('questions');
  }
  next();
});

module.exports = mongoose.model('Exam', examSchema);
