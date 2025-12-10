import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { examService } from '../services/api';
import { FiKey, FiLock } from 'react-icons/fi';

const ExamCodeEntry = () => {
  const navigate = useNavigate();
  const [examCode, setExamCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!examCode || examCode.length < 6) {
      toast.error('Please enter a valid exam code');
      return;
    }

    setLoading(true);
    try {
      const response = await examService.validateExamAccess(examCode.toUpperCase());
      toast.success('Access granted! Starting exam...');
      navigate(`/student/exam/${response.data.data.exam.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid exam code or access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
          <FiKey className="text-blue-600 dark:text-blue-300" size={32} />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-gray-100">
        Enter Exam Code
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Enter the code provided by your examiner to access the exam
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FiLock className="inline mr-2" />
            Exam Code
          </label>
          <input
            type="text"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value.toUpperCase())}
            placeholder="XXXXXXXX"
            maxLength="10"
            className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Enter the 8-character code exactly as provided
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !examCode}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Validating...' : 'Access Exam'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Note:</strong> The exam code is provided by your examiner. Make sure you have the correct code before attempting to join.
        </p>
      </div>
    </div>
  );
};

export default ExamCodeEntry;
