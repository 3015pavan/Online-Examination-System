const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

const exportResultsToCSV = async (results, examTitle) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `results_${examTitle.replace(/\s+/g, '_')}_${timestamp}.csv`;
  const filepath = path.join(__dirname, '../exports', filename);

  // Create exports directory if it doesn't exist
  const exportDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'studentName', title: 'Student Name' },
      { id: 'registrationNumber', title: 'Registration Number' },
      { id: 'obtainedMarks', title: 'Obtained Marks' },
      { id: 'totalMarks', title: 'Total Marks' },
      { id: 'percentage', title: 'Percentage' },
      { id: 'correctAnswers', title: 'Correct Answers' },
      { id: 'incorrectAnswers', title: 'Incorrect Answers' },
      { id: 'unattemptedQuestions', title: 'Unattempted' },
      { id: 'status', title: 'Status' },
      { id: 'submittedAt', title: 'Submitted At' },
    ],
  });

  const records = results.map((result) => ({
    studentName: result.studentName,
    registrationNumber: result.registrationNumber,
    obtainedMarks: result.totalObtainedMarks,
    totalMarks: result.totalScore,
    percentage: result.percentage,
    correctAnswers: result.correctAnswers,
    incorrectAnswers: result.incorrectAnswers,
    unattemptedQuestions: result.unattemptedQuestions,
    status: result.status,
    submittedAt: new Date(result.submittedAt).toLocaleString(),
  }));

  await csvWriter.writeRecords(records);
  return filepath;
};

module.exports = { exportResultsToCSV };
