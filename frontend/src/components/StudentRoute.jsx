import { Navigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

const StudentRoute = ({ children }) => {
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'student') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default StudentRoute;
