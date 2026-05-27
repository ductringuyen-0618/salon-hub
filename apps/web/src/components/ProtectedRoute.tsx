import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  requireAuth = true 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && (!user || !['ADMIN', 'MANAGER'].includes(user.role))) {
    // Redirect to home if not admin/manager
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;