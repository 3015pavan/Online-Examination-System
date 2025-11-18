import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../context/authStore';
import { questionService, examService } from '../../services/api';
import { FiEdit2, FiTrash2, FiPlus, FiChevronLeft } from 'react-icons/fi';

const QuestionsManagement = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    questionText: '',
    options: [
      { optionLetter: 'A', optionText: '' },
      { optionLetter: 'B', optionText: '' },
      { optionLetter: 'C', optionText: '' },
      { optionLetter: 'D', optionText: '' },
    ],
    correctAnswer: 'A',
    explanation: '',
  });

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examRes, questionsRes] = await Promise.all([
        examService.getExamById(examId),
        questionService.getQuestionsByExam(examId),
      ]);
      setExam(examRes.data.data);
      setQuestions(questionsRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
      navigate('/admin/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].optionText = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        examId,
        questionText: formData.questionText,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        questionType: 'mcq',
      };

      if (editingId) {
        await questionService.updateQuestion(editingId, data);
        toast.success('Question updated successfully');
      } else {
        await questionService.createQuestion(data);
        toast.success('Question created successfully');
      }

      setFormData({
        questionText: '',
        options: [
          { optionLetter: 'A', optionText: '' },
          { optionLetter: 'B', optionText: '' },
          { optionLetter: 'C', optionText: '' },
          { optionLetter: 'D', optionText: '' },
        ],
        correctAnswer: 'A',
        explanation: '',
      });
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionService.deleteQuestion(id);
        toast.success('Question deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
  };

  const handleEdit = (question) => {
    setFormData({
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    });
    setEditingId(question._id);
    setShowForm(true);
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
        title={`Questions - ${exam?.title}`}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/exams')}
          className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-700"
        >
          <FiChevronLeft /> Back to Exams
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {exam?.title} - Questions
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                questionText: '',
                options: [
                  { optionLetter: 'A', optionText: '' },
                  { optionLetter: 'B', optionText: '' },
                  { optionLetter: 'C', optionText: '' },
                  { optionLetter: 'D', optionText: '' },
                ],
                correctAnswer: 'A',
                explanation: '',
              });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus /> {showForm ? 'Cancel' : 'Add Question'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Question' : 'Add New Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionText: e.target.value })
                  }
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Enter question text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-3">
                  {formData.options.map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="w-12 px-4 py-2 bg-gray-100 rounded-lg flex items-center font-semibold">
                        {option.optionLetter}.
                      </span>
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${option.optionLetter}`}
                        required
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData({ ...formData, correctAnswer: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (Optional)
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Provide explanation for the answer..."
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {editingId ? 'Update' : 'Create'} Question
              </button>
            </form>
          </div>
        )}

        {/* Questions List */}
        {questions.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No questions found</p>
        ) : (
          <div className="space-y-4">
            {questions.map((question, idx) => (
              <div
                key={question._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Q{idx + 1}. {question.questionText}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {question.options?.map((option, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-3 rounded ${
                        option.optionLetter === question.correctAnswer
                          ? 'bg-green-50 border border-green-300'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <span className="font-semibold">
                        {option.optionLetter}.
                      </span>{' '}
                      {option.optionText}
                      {option.optionLetter === question.correctAnswer && (
                        <span className="ml-2 text-green-600 font-semibold">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="p-3 bg-blue-50 rounded text-sm text-gray-700">
                    <span className="font-semibold">Explanation:</span>{' '}
                    {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionsManagement;
