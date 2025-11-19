import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import useAuthStore from '../../context/authStore';
import { resultService } from '../../services/api';
import {
  FiUsers,
  FiBookOpen,
  FiAward,
  FiBarChart2,
  FiSettings,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await resultService.getDashboardStatistics();
      setStats(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigationItems = [
    { label: 'Students', icon: FiUsers, path: '/admin/students' },
    { label: 'Exams', icon: FiBookOpen, path: '/admin/exams' },
    { label: 'Results', icon: FiBarChart2, path: '/admin/results' },
    { label: 'Settings', icon: FiSettings, path: '/admin/settings' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <Navbar
        title="Admin Dashboard"
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.path !== '#') navigate(item.path);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow hover:shadow-md transition"
              >
                <IconComponent size={20} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={<FiUsers size={24} />}
            color="blue"
          />
          <StatCard
            title="Total Exams"
            value={stats?.totalExams || 0}
            icon={<FiBookOpen size={24} />}
            color="green"
          />
          <StatCard
            title="Results Conducted"
            value={stats?.totalResultsConducted || 0}
            icon={<FiAward size={24} />}
            color="purple"
          />
          <StatCard
            title="Avg Score"
            value={stats?.averageScore || 0}
            icon={<FiBarChart2 size={24} />}
            color="red"
          />
        </div>

        {/* Highest Score */}
        <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Highest Score</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.highestScore || 0}
              </p>
            </div>
            <div className="p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-gray-600 dark:text-gray-300 mb-2">Average Percentage</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats?.averageScore}%
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
