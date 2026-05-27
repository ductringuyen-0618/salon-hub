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
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  // Wait for the FIRST session check to settle before making redirect
  // decisions. Otherwise the fallback CUSTOMER role from the initial
  // Supabase session would briefly trip the requireAdmin redirect before
  // the real role merges in from /api/auth/me. We use `initializing`
  // (not `loading`) so this doesn't fire during in-flight actions.
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen text-dynamic-text-secondary">
        Loading...
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && (!user || !['ADMIN', 'MANAGER'].includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;