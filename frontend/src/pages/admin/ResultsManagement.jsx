import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../context/authStore';
import { examService, resultService } from '../../services/api';
import { FiDownload, FiEye, FiChevronLeft } from 'react-icons/fi';

const ResultsManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await examService.getAllExams();
      setExams(res.data.data);
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleExamSelect = async (examId) => {
    try {
      setLoading(true);
      setSelectedExam(examId);
      const res = await resultService.getAllResultsForExam(examId);
      setResults(res.data.data);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async (examId) => {
    try {
      const response = await resultService.exportResultsToCSV(examId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results-${examId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      toast.success('Results downloaded successfully');
    } catch (error) {
      toast.error('Failed to download results');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading && exams.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        title="Results Management"
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700"
        >
          <FiChevronLeft /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Exam List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Exams</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {exams.map((exam) => (
                  <button
                    key={exam._id}
                    onClick={() => handleExamSelect(exam._id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedExam === exam._id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="font-semibold">{exam.title}</p>
                    <p className="text-sm opacity-75">
                      {exam.questions?.length || 0} questions
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="lg:col-span-3">
            {selectedExam ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Results</h2>
                  <button
                    onClick={() => handleDownloadCSV(selectedExam)}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <FiDownload /> Export CSV
                  </button>
                </div>

                {results.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">
                    No results found for this exam
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">
                            Reg No
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">
                            Percentage
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">
                            Correct
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-sm font-semibold">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result) => (
                          <tr key={result._id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900">
                              {result.studentName}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {result.registrationNumber}
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              {result.totalObtainedMarks}/{result.totalScore}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  result.isPassed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {result.percentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {result.correctAnswers}/
                              {result.correctAnswers +
                                result.incorrectAnswers +
                                result.unattemptedQuestions}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  result.isPassed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {result.isPassed ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/admin/result-detail/${result.studentId._id}/${selectedExam}`
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <FiEye size={16} /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">
                  Select an exam to view results
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsManagement;
