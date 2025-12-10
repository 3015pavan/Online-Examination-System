import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { examService } from '../services/api';
import { FiCalendar, FiClock, FiKey, FiPlay, FiSquare, FiCopy } from 'react-icons/fi';

const ExamScheduler = ({ exam, onUpdate }) => {
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [examDetails, setExamDetails] = useState(exam);

  useEffect(() => {
    setExamDetails(exam);
    if (exam.scheduledStartTime) {
      setScheduledStartTime(new Date(exam.scheduledStartTime).toISOString().slice(0, 16));
    }
    if (exam.scheduledEndTime) {
      setScheduledEndTime(new Date(exam.scheduledEndTime).toISOString().slice(0, 16));
    }
  }, [exam]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    
    if (!scheduledStartTime) {
      toast.error('Please select start time');
      return;
    }

    setLoading(true);
    try {
      const response = await examService.scheduleExam(examDetails._id, {
        scheduledStartTime,
        scheduledEndTime: scheduledEndTime || undefined,
      });
      toast.success('Exam scheduled successfully');
      setExamDetails(response.data.data);
      if (onUpdate) onUpdate(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule exam');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!examDetails.scheduledStartTime) {
      toast.error('Please schedule the exam first');
      return;
    }

    setLoading(true);
    try {
      const response = await examService.generateExamCode(examDetails._id);
      toast.success('Exam code generated successfully!');
      setExamDetails({ ...examDetails, ...response.data.data });
      if (onUpdate) onUpdate({ ...examDetails, ...response.data.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!examDetails.examCode) {
      toast.error('Please generate exam code first');
      return;
    }

    setLoading(true);
    try {
      const response = await examService.startExam(examDetails._id);
      toast.success('Exam started! Students can now join.');
      setExamDetails(response.data.data);
      if (onUpdate) onUpdate(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start exam');
    } finally {
      setLoading(false);
    }
  };

  const handleEndExam = async () => {
    if (window.confirm('Are you sure you want to end this exam?')) {
      setLoading(true);
      try {
        const response = await examService.endExam(examDetails._id);
        toast.success('Exam ended successfully');
        setExamDetails(response.data.data);
        if (onUpdate) onUpdate(response.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to end exam');
      } finally {
        setLoading(false);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Exam Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {examDetails.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Exam Management</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(examDetails.examStatus)}`}>
          {examDetails.examStatus?.toUpperCase()}
        </span>
      </div>

      {/* Exam Code Display */}
      {examDetails.examCode && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exam Code</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold font-mono tracking-wider text-blue-700 dark:text-blue-300">
                  {examDetails.examCode}
                </span>
                <button
                  onClick={() => copyToClipboard(examDetails.examCode)}
                  className="p-2 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg transition"
                  title="Copy to clipboard"
                >
                  <FiCopy className="text-blue-600 dark:text-blue-300" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Share this code with students to join the exam
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Form */}
      {examDetails.examStatus === 'created' && (
        <form onSubmit={handleSchedule} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FiCalendar /> Schedule Exam
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledEndTime}
                onChange={(e) => setScheduledEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule Exam'}
          </button>
        </form>
      )}

      {/* Scheduled Time Display */}
      {examDetails.scheduledStartTime && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <FiClock /> Scheduled Start
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {new Date(examDetails.scheduledStartTime).toLocaleString()}
              </p>
            </div>
            {examDetails.scheduledEndTime && (
              <div>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <FiClock /> Scheduled End
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(examDetails.scheduledEndTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {examDetails.examStatus === 'scheduled' && !examDetails.examCode && (
          <button
            onClick={handleGenerateCode}
            disabled={loading}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FiKey /> Generate Exam Code
          </button>
        )}

        {examDetails.examCode && examDetails.examStatus !== 'active' && examDetails.examStatus !== 'completed' && (
          <button
            onClick={handleStartExam}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FiPlay /> Start Exam
          </button>
        )}

        {examDetails.examStatus === 'active' && (
          <button
            onClick={handleEndExam}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FiSquare /> End Exam
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h5 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Instructions:</h5>
        <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1 list-disc list-inside">
          <li>Schedule the exam at least 30 minutes before start time</li>
          <li>Generate exam code minimum 30 minutes before scheduled time</li>
          <li>Share the code with students before exam starts</li>
          <li>Start the exam manually or it will auto-start at scheduled time</li>
          <li>Students can only join when exam status is "Active"</li>
        </ul>
      </div>
    </div>
  );
};

export default ExamScheduler;
