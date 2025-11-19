import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    registrationNumber: '',
    department: '',
    semester: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Registration successful');
      if (formData.role === 'conductor') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left visual */}
        <div className="hidden md:flex flex-col items-start justify-center p-10 bg-gradient-to-br from-indigo-600 to-blue-600 text-white gap-6">
          <h2 className="text-4xl font-extrabold">Create Your Account</h2>
          <p className="text-sm opacity-90 max-w-xs">Sign up as a Student or Exam Conductor to manage or take exams. Seamless, secure & fast.</p>
          <div className="mt-4">
            <p className="text-sm">Need help? Contact support at <span className="font-medium">support@example.com</span></p>
          </div>
        </div>

        {/* Form area */}
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Register</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Create your account (Student or Exam Conductor)</p>
            </div>
            <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium">Login</Link></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><FiUser /> Full Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-2 block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </label>

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

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'student' })} className={`px-4 py-2 rounded-lg border ${formData.role === 'student' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700'}`}>
                Student
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'conductor' })} className={`px-4 py-2 rounded-lg border ${formData.role === 'conductor' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700'}`}>
                Exam Conductor
              </button>
            </div>

            {formData.role === 'student' && (
              <>
                <label className="block">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Registration Number</span>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                    className="mt-2 block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="REG123456"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Department</span>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="CSE" />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Semester</span>
                    <input type="number" name="semester" value={formData.semester} onChange={handleChange} className="mt-2 block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="4" />
                  </label>
                </div>
              </>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-300 sm:hidden">Already have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium">Login</Link></div>
        </div>
      </div>
    </div>
  );
};

export default Register;
