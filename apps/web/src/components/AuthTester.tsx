import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuthTester: React.FC = () => {
  const { login, isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [autoLoginDone, setAutoLoginDone] = useState(false);

  const handleTestLogin = async () => {
    try {
      await login('admin@salonhub.com', 'admin123');
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleTestLogout = () => {
    logout();
    console.log('Logged out');
    setAutoLoginDone(false);
  };

  const handleTestAdminNavigation = () => {
    navigate('/admin');
  };

  // Auto-login for testing
  useEffect(() => {
    if (!loading && !isAuthenticated && !autoLoginDone) {
      console.log('Auto-logging in for testing...');
      handleTestLogin();
      setAutoLoginDone(true);
    }
  }, [loading, isAuthenticated, autoLoginDone]);

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, user, loading });
  }, [isAuthenticated, user, loading]);

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-bold mb-4">Auth Tester (Auto-Login Enabled)</h3>
      
      <div className="space-y-2">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? `${user.name} (${user.role})` : 'None'}</p>
      </div>

      <div className="mt-4 space-x-2">
        <Button onClick={handleTestLogin} disabled={loading}>
          Manual Login
        </Button>
        <Button onClick={handleTestLogout} disabled={loading}>
          Test Logout
        </Button>
        <Button onClick={handleTestAdminNavigation} disabled={!isAuthenticated}>
          Test Admin Navigation
        </Button>
      </div>
    </div>
  );
};

export default AuthTester;
