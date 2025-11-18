import { Navigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
