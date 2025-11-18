import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import { resultService } from '../services/api';
import Navbar from '../components/Navbar';
import {
  FiCheckCircle,
  FiX,
  FiHelpCircle,
  FiClock,
  FiAward,
} from 'react-icons/fi';

const ResultPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [examId]);

  const fetchResult = async () => {
    try {
      const res = await resultService.getExamResult(examId);
      setResult(res.data.data);
    } catch (error) {
      toast.error('Failed to load result');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading result...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">Failed to load result</div>
      </div>
    );
  }

  const passPercentage = 40; // Default passing percentage
  const isPassed = result.percentage >= passPercentage;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        title="Exam Result"
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Result Summary */}
        <div
          className={`rounded-lg shadow-md p-8 mb-8 text-white ${
            isPassed ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-red-600 to-red-700'
          }`}
        >
          <div className="text-center">
            {isPassed ? (
              <FiCheckCircle className="text-6xl mx-auto mb-4" />
            ) : (
              <FiX className="text-6xl mx-auto mb-4" />
            )}
            <h1 className="text-4xl font-bold mb-2">
              {isPassed ? 'Congratulations!' : 'Result'}
            </h1>
            <p className="text-xl mb-6">
              {isPassed
                ? 'You have successfully passed the exam'
                : 'You did not pass the exam'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              <div>
                <p className="text-sm opacity-90">Score</p>
                <p className="text-3xl font-bold">
                  {result.totalObtainedMarks}/{result.totalScore}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">Percentage</p>
                <p className="text-3xl font-bold">{result.percentage}%</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Correct</p>
                <p className="text-3xl font-bold">{result.correctAnswers}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Incorrect</p>
                <p className="text-3xl font-bold">{result.incorrectAnswers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Detailed Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <FiCheckCircle className="text-green-600 mr-2" size={20} />
                <span className="font-semibold text-gray-900">
                  Correct Answers
                </span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {result.correctAnswers}
              </p>
            </div>

            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center mb-2">
                <FiX className="text-red-600 mr-2" size={20} />
                <span className="font-semibold text-gray-900">
                  Incorrect Answers
                </span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                {result.incorrectAnswers}
              </p>
            </div>

            <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <FiHelpCircle className="text-yellow-600 mr-2" size={20} />
                <span className="font-semibold text-gray-900">
                  Unattempted
                </span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {result.unattemptedQuestions}
              </p>
            </div>

            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <FiClock className="text-purple-600 mr-2" size={20} />
                <span className="font-semibold text-gray-900">
                  Time Taken
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {Math.floor(result.totalTimeSpent / 60)}:{(result.totalTimeSpent % 60)
                  .toString()
                  .padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Question Review
          </h2>

          {result.responses?.map((response, idx) => (
            <div
              key={idx}
              className={`mb-6 p-6 border rounded-lg ${
                response.isCorrect
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  Q{idx + 1}. {response.questionId?.questionText}
                </h3>
                {response.isCorrect ? (
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Correct
                  </span>
                ) : (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ✗ Incorrect
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Your Answer:</p>
                  <p className="font-semibold text-gray-900">
                    {response.selectedAnswer || 'Not Attempted'}
                  </p>
                </div>

                {!response.isCorrect && (
                  <div>
                    <p className="text-sm text-gray-600">Correct Answer:</p>
                    <p className="font-semibold text-green-600">
                      {response.questionId?.correctAnswer}
                    </p>
                  </div>
                )}

                {response.questionId?.explanation && (
                  <div>
                    <p className="text-sm text-gray-600">Explanation:</p>
                    <p className="text-gray-700">
                      {response.questionId.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
