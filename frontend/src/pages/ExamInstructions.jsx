import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import { examService, resultService } from '../services/api';
import Navbar from '../components/Navbar';

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const res = await examService.getExamById(examId);
      setExam(res.data.data);
    } catch (error) {
      toast.error('Failed to load exam');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!agreed) {
      toast.error('Please agree to the instructions');
      return;
    }

    try {
      await resultService.startExam(examId);
      navigate(`/student/exam-page/${examId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start exam');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        title="Exam Instructions"
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            {exam?.title}
          </h1>

          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-bold mb-4 text-blue-900">
              Exam Instructions
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {exam?.instructions}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Exam Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exam?.duration} minutes
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exam?.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Marks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exam?.totalMarks}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Marks per Question</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exam?.perQuestionMarks}
                </p>
              </div>
              {exam?.negativeMarking > 0 && (
                <div>
                  <p className="text-gray-600">Negative Marking</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{exam?.negativeMarking}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 mb-8 border border-yellow-200">
            <h3 className="text-lg font-bold mb-4 text-yellow-900">Important</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ You cannot pause the exam once started</li>
              <li>✓ The exam will auto-submit when time ends</li>
              <li>✓ Do not switch tabs or windows (monitored)</li>
              <li>✓ All your answers will be saved automatically</li>
              <li>✓ You can review and change answers before submission</li>
            </ul>
          </div>

          <div className="flex items-center mb-8">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mr-3"
            />
            <label htmlFor="agree" className="text-gray-700">
              I have read and agree to follow all the exam instructions and
              rules
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Go Back
            </button>
            <button
              onClick={handleStartExam}
              disabled={!agreed}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Exam
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamInstructions;
