import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import { examService, resultService } from '../services/api';
import ExamTimer from '../components/ExamTimer';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeStarted, setTimeStarted] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const [examRes, questionsRes] = await Promise.all([
        examService.getExamById(examId),
        examService.getExamById(examId).then((res) => ({
          data: {
            data: res.data.data.questions.map((q) => ({
              ...q,
              questionNumber: q.questionNumber || questions.indexOf(q) + 1,
            })),
          },
        })),
      ]);

      setExam(examRes.data.data);
      setQuestions(examRes.data.data.questions || []);
      setAnswers({});
    } catch (error) {
      toast.error('Failed to load exam');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = async (answer) => {
    const newAnswers = { ...answers, [currentQuestion._id]: answer };
    setAnswers(newAnswers);

    try {
      await resultService.saveAnswer(examId, {
        questionId: currentQuestion._id,
        selectedAnswer: answer,
      });
    } catch (error) {
      toast.error('Failed to save answer');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleTimeEnd = async () => {
    setTimeExpired(true);
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const totalTimeSpent = Math.floor((Date.now() - timeStarted) / 1000);
      await resultService.submitExam(examId, { totalTimeSpent });
      toast.success('Exam submitted successfully');
      navigate(`/student/result/${examId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading exam...</div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">Failed to load exam</div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const questionsToGo = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{exam.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <ExamTimer
            duration={exam.duration}
            onTimeEnd={handleTimeEnd}
            isRunning={!timeExpired}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-md p-8">
              {currentQuestion && (
                <>
                  {/* Question Text */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      Q{currentQuestionIndex + 1}. {currentQuestion.questionText}
                    </h2>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-8">
                    {currentQuestion.options?.map((option, idx) => (
                      <label
                        key={option._id || idx}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                            answers[currentQuestion._id] === option.optionLetter
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                          }`}
                      >
                        <input
                          type="radio"
                          name="option"
                          value={option.optionLetter}
                          checked={
                            answers[currentQuestion._id] === option.optionLetter
                          }
                          onChange={() =>
                            handleAnswerSelect(option.optionLetter)
                          }
                          className="mr-3"
                        />
                        <span className="font-semibold mr-2">
                          {option.optionLetter}.
                        </span>
                        <span>{option.optionText}</span>
                      </label>
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft /> Previous
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <FiChevronRight />
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="ml-auto px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100">Questions</h3>

              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Answered: {answeredCount}/{questions.length}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(answeredCount / questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q._id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`p-2 rounded text-sm font-semibold transition ${
                      currentQuestionIndex === idx
                        ? 'bg-blue-600 text-white'
                        : answers[q._id]
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamPage;
