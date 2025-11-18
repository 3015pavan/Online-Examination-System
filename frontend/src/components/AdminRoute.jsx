import { Navigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Allow both 'admin' and 'conductor' roles to access admin routes
  if (!['admin', 'conductor'].includes(user?.role)) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
