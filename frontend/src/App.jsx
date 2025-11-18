import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ExamInstructions from './pages/ExamInstructions';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';

// Components
import PrivateRoute from './components/PrivateRoute';
import StudentRoute from './components/StudentRoute';
import AdminRoute from './components/AdminRoute';

// Admin pages (to be created)
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsManagement from './pages/admin/StudentsManagement';
import ExamsManagement from './pages/admin/ExamsManagement';
import QuestionsManagement from './pages/admin/QuestionsManagement';
import ResultsManagement from './pages/admin/ResultsManagement';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />
        <Route
          path="/student/exam/:examId"
          element={
            <StudentRoute>
              <ExamInstructions />
            </StudentRoute>
          }
        />
        <Route
          path="/student/exam-page/:examId"
          element={
            <StudentRoute>
              <ExamPage />
            </StudentRoute>
          }
        />
        <Route
          path="/student/result/:examId"
          element={
            <StudentRoute>
              <ResultPage />
            </StudentRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <AdminRoute>
              <StudentsManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/exams"
          element={
            <AdminRoute>
              <ExamsManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/questions/:examId"
          element={
            <AdminRoute>
              <QuestionsManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <AdminRoute>
              <ResultsManagement />
            </AdminRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
