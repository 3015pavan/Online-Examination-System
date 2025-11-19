import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import useAuthStore from '../context/authStore';
import { examService, resultService } from '../services/api';
import { FiBookOpen, FiCheckCircle, FiAward } from 'react-icons/fi';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ attempted: 0, passed: 0, totalExams: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, resultsRes] = await Promise.all([
        examService.getAssignedExams(),
        resultService.getStudentResults(),
      ]);

      setExams(examsRes.data.data);
      setResults(resultsRes.data.data);

      // Calculate stats
      const attempted = resultsRes.data.data.length;
      const passed = resultsRes.data.data.filter((r) => r.isPassed).length;

      setStats({
        attempted,
        passed,
        totalExams: examsRes.data.data.length,
      });
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/student/exam/${examId}`);
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
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <Navbar title="Student Dashboard" user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Exams"
            value={stats.totalExams}
            icon={<FiBookOpen size={24} />}
            color="blue"
          />
          <StatCard
            title="Exams Attempted"
            value={stats.attempted}
            icon={<FiCheckCircle size={24} />}
            color="green"
          />
          <StatCard
            title="Exams Passed"
            value={stats.passed}
            icon={<FiAward size={24} />}
            color="purple"
          />
        </div>

        {/* Available Exams */}
        <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Available Exams</h2>
          {exams.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              No exams assigned to you yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map((exam) => {
                const attemptedResult = results.find(
                  (r) => r.examId._id === exam._id
                );

                return (
                  <div
                    key={exam._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition bg-white dark:bg-gray-800"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {exam.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{exam.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-semibold">{exam.duration} mins</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Marks:</span>
                        <p className="font-semibold">{exam.totalMarks}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Questions:</span>
                        <p className="font-semibold">{exam.totalQuestions}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-semibold">
                          {attemptedResult
                            ? attemptedResult.status === 'submitted'
                              ? 'Completed'
                              : 'In Progress'
                            : 'Not Started'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartExam(exam._id)}
                        className="flex-1 bg-blue-600 dark:bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        {attemptedResult ? 'Resume' : 'Start'} Exam
                      </button>
                      {attemptedResult && (
                        <button
                          onClick={() =>
                            navigate(`/student/result/${exam._id}`)
                          }
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          View Result
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
