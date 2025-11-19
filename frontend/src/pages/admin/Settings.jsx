import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../context/authStore';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const [siteTitle, setSiteTitle] = useState('Online Examination System');
  const [clientUrl, setClientUrl] = useState(process.env.REACT_APP_API_URL || 'http://localhost:5000');

  const handleSave = (e) => {
    e.preventDefault();
    // For now, persist only locally (placeholder)
    toast.success('Settings saved (local only)');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Admin Settings" user={user} onLogout={handleLogout} />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Title</label>
              <input
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">API URL</label>
              <input
                value={clientUrl}
                onChange={(e) => setClientUrl(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded p-2"
              />
              <p className="text-xs text-gray-500 mt-1">Update your API URL for local testing (placeholder)</p>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;
