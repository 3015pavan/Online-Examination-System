/**
 * Seed Data Script for Online Examination System
 * Run: node scripts/seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/examination-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Exam.deleteMany({});
    await Question.deleteMany({});

    // Create Admin User
    console.log('Creating admin user...');
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });
    await admin.save();

    // Create Student Users
    console.log('Creating student users...');
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const student = new User({
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        password: 'student123',
        registrationNumber: `REG${1000 + i}`,
        department: 'Computer Science',
        semester: Math.floor(Math.random() * 8) + 1,
        role: 'student',
        isActive: true,
      });
      await student.save();
      students.push(student);
    }

    // Create Exams
    console.log('Creating exams...');
    const exam1 = new Exam({
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics',
      duration: 60,
      totalMarks: 100,
      perQuestionMarks: 1,
      negativeMarking: 0.25,
      totalQuestions: 100,
      examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '10:00',
      instructions:
        'Read the questions carefully. Answer all 100 questions. No negative marking for unanswered questions.',
      passingMarks: 40,
      assignedTo: students.map((s) => s._id),
      createdBy: admin._id,
    });
    await exam1.save();

    const exam2 = new Exam({
      title: 'React.js Advanced Concepts',
      description: 'Master advanced React patterns and techniques',
      duration: 90,
      totalMarks: 100,
      perQuestionMarks: 2,
      negativeMarking: 0.5,
      totalQuestions: 50,
      examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '11:30',
      instructions:
        'This is an advanced level exam. Answer all questions. Negative marking applied for wrong answers.',
      passingMarks: 50,
      assignedTo: students.slice(0, 3).map((s) => s._id),
      createdBy: admin._id,
    });
    await exam2.save();

    // Create Questions for Exam 1
    console.log('Creating questions...');
    const questionTexts1 = [
      'What is the correct way to declare a variable in JavaScript?',
      'Which method is used to find the length of a string?',
      'What does JSON stand for?',
      'How do you round the number 7.25 to the nearest integer?',
      'What is the output of typeof "Hello"?',
    ];

    const options = [
      {
        A: 'string',
        B: 'boolean',
        C: 'object',
        D: 'number',
      },
      {
        A: '.getLength()',
        B: '.length',
        C: '.size()',
        D: '.len()',
      },
      {
        A: 'JavaScript Object Notation',
        B: 'JavaScript Online Notation',
        C: 'Java Serialized Object Notation',
        D: 'JavaScript Observable Notation',
      },
      {
        A: 'Math.rnd()',
        B: 'Math.round()',
        C: 'Math.roundNumber()',
        D: 'Math.approx()',
      },
      {
        A: '"string"',
        B: 'String',
        C: '"String"',
        D: 'Undefined',
      },
    ];

    const correctAnswers = ['A', 'B', 'A', 'B', 'A'];

    for (let i = 0; i < questionTexts1.length; i++) {
      const question = new Question({
        examId: exam1._id,
        questionText: questionTexts1[i],
        questionType: 'mcq',
        options: [
          { optionLetter: 'A', optionText: options[i].A },
          { optionLetter: 'B', optionText: options[i].B },
          { optionLetter: 'C', optionText: options[i].C },
          { optionLetter: 'D', optionText: options[i].D },
        ],
        correctAnswer: correctAnswers[i],
        explanation: `The correct answer is ${correctAnswers[i]}.`,
        marks: 1,
        negativeMarks: 0.25,
        questionNumber: i + 1,
      });
      await question.save();
      exam1.questions.push(question._id);
    }

    await exam1.save();

    // Create Questions for Exam 2
    const questionTexts2 = [
      'What is the purpose of React Hooks?',
      'What does useEffect do?',
      'What is the Virtual DOM?',
      'How do you pass props in React?',
      'What is state in React?',
    ];

    const options2 = [
      {
        A: 'To catch errors in code',
        B: 'To manage side effects in functional components',
        C: 'To style components',
        D: 'To handle routing',
      },
      {
        A: 'To fetch data',
        B: 'To perform side effects after render',
        C: 'To manage component state',
        D: 'To handle user events',
      },
      {
        A: 'A copy of the real DOM in memory',
        B: 'A virtual machine',
        C: 'A visual representation tool',
        D: 'A development environment',
      },
      {
        A: 'Using global variables',
        B: 'Using function parameters',
        C: 'Passing them as attributes to components',
        D: 'Using localStorage',
      },
      {
        A: 'Global data store',
        B: 'Data that can be changed by the component',
        C: 'Component configuration',
        D: 'Server data',
      },
    ];

    const correctAnswers2 = ['B', 'B', 'A', 'C', 'B'];

    for (let i = 0; i < questionTexts2.length; i++) {
      const question = new Question({
        examId: exam2._id,
        questionText: questionTexts2[i],
        questionType: 'mcq',
        options: [
          { optionLetter: 'A', optionText: options2[i].A },
          { optionLetter: 'B', optionText: options2[i].B },
          { optionLetter: 'C', optionText: options2[i].C },
          { optionLetter: 'D', optionText: options2[i].D },
        ],
        correctAnswer: correctAnswers2[i],
        explanation: `The correct answer is ${correctAnswers2[i]}.`,
        marks: 2,
        negativeMarks: 0.5,
        questionNumber: i + 1,
      });
      await question.save();
      exam2.questions.push(question._id);
    }

    await exam2.save();

    console.log('✓ Seed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin - Email: admin@example.com, Password: admin123');
    console.log('Student - Email: student1@example.com, Password: student123');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
