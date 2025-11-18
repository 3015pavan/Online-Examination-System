import axiosInstance from './axios';

export const authService = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  refreshToken: (refreshToken) =>
    axiosInstance.post('/auth/refresh-token', { refreshToken }),
  getCurrentUser: () => axiosInstance.get('/auth/me'),
  logout: () => axiosInstance.post('/auth/logout'),
};

export const studentService = {
  getAllStudents: () => axiosInstance.get('/students'),
  getStudentById: (id) => axiosInstance.get(`/students/${id}`),
  createStudent: (data) => axiosInstance.post('/students', data),
  updateStudent: (id, data) => axiosInstance.put(`/students/${id}`, data),
  deleteStudent: (id) => axiosInstance.delete(`/students/${id}`),
  deactivateStudent: (id) => axiosInstance.patch(`/students/${id}/deactivate`),
  activateStudent: (id) => axiosInstance.patch(`/students/${id}/activate`),
};

export const examService = {
  getAllExams: () => axiosInstance.get('/exams'),
  getExamById: (id) => axiosInstance.get(`/exams/${id}`),
  createExam: (data) => axiosInstance.post('/exams', data),
  updateExam: (id, data) => axiosInstance.put(`/exams/${id}`, data),
  deleteExam: (id) => axiosInstance.delete(`/exams/${id}`),
  getAssignedExams: () => axiosInstance.get('/exams/assigned'),
  assignExamToStudents: (examId, studentIds) =>
    axiosInstance.post(`/exams/${examId}/assign-students`, { studentIds }),
  removeExamFromStudents: (examId, studentIds) =>
    axiosInstance.post(`/exams/${examId}/remove-students`, { studentIds }),
  getExamStatistics: (examId) =>
    axiosInstance.get(`/exams/${examId}/statistics`),
};

export const questionService = {
  getQuestionsByExam: (examId) =>
    axiosInstance.get(`/questions/exam/${examId}`),
  getQuestionById: (id) => axiosInstance.get(`/questions/${id}`),
  createQuestion: (data) => axiosInstance.post('/questions', data),
  updateQuestion: (id, data) => axiosInstance.put(`/questions/${id}`, data),
  deleteQuestion: (id) => axiosInstance.delete(`/questions/${id}`),
  bulkCreateQuestions: (data) =>
    axiosInstance.post('/questions/bulk-create', data),
  getQuestionForStudent: (id) =>
    axiosInstance.get(`/questions/${id}/for-student`),
};

export const resultService = {
  startExam: (examId) => axiosInstance.post(`/results/${examId}/start`),
  saveAnswer: (examId, data) =>
    axiosInstance.post(`/results/${examId}/save-answer`, data),
  submitExam: (examId, data) =>
    axiosInstance.post(`/results/${examId}/submit`, data),
  getExamResult: (examId) => axiosInstance.get(`/results/${examId}/result`),
  getStudentResults: () => axiosInstance.get('/results/my-results'),
  getAllResultsForExam: (examId) =>
    axiosInstance.get(`/results/exam/${examId}/all-results`),
  exportResultsToCSV: (examId) =>
    axiosInstance.get(`/results/exam/${examId}/export-csv`, {
      responseType: 'blob',
    }),
  getStudentResultDetails: (studentId, examId) =>
    axiosInstance.get(`/results/student/${studentId}/${examId}`),
  getDashboardStatistics: () =>
    axiosInstance.get('/results/dashboard/statistics'),
};
