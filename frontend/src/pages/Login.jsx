import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '', examinerId: '' });
  const [isStudent, setIsStudent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData.email, formData.password, formData.examinerId);
      toast.success('Login successful');
      
      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left panel */}
        <div className="hidden md:flex flex-col items-start justify-center p-10 bg-blue-600 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 text-white gap-6">
          <h2 className="text-4xl font-extrabold">Welcome Back</h2>
          <p className="text-sm opacity-90 max-w-xs">Sign in to access exams, track results, and manage your account. Fast, secure and easy.</p>
          <ul className="space-y-2 text-sm">
            <li>• Secure authentication</li>
            <li>• Timed exams with auto-submit</li>
            <li>• Exportable results</li>
          </ul>
        </div>

        {/* Right (form) panel */}
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Exam System</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Login to your account</p>
            </div>
            <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">New? <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium">Create account</Link></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><FiMail /> Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><FiLock /> Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-2 block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">I am a Student</span>
                <input
                  type="checkbox"
                  checked={isStudent}
                  onChange={(e) => setIsStudent(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
              </div>
            </label>

            {isStudent && (
              <label className="block">
                <span className="text-sm text-gray-700 dark:text-gray-300">Examiner ID</span>
                <input
                  type="text"
                  name="examinerId"
                  value={formData.examinerId}
                  onChange={handleChange}
                  required={isStudent}
                  className="mt-2 block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your examiner's ID"
                />
              </label>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
                Remember me
              </label>
              <Link to="#" className="text-sm text-blue-600 dark:text-blue-400">Forgot?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300 sm:hidden">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
