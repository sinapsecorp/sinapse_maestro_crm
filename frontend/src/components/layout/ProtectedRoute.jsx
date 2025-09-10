import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useEffect } from 'react';
import Layout from './Layout';

const ProtectedRoute = () => {
  const { isAuthenticated, checkAuth, initialized } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!initialized) {
    return null; // or a splash/loading
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;
