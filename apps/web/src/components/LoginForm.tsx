import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { LoginRequest } from '@/services/api';
import { API_CONFIG } from '@/config/api';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !shouldNavigate) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, shouldNavigate]);

  // Handle role-based navigation after login
  React.useEffect(() => {
    if (isAuthenticated && user && shouldNavigate) {
      const from = location.state?.from?.pathname;
      
      // Show success toast
      success('Login Successful!', `Welcome back, ${user.name}`);
      
      // Always navigate to home page after successful login
      navigate('/', { replace: true });
      setShouldNavigate(false);
    }
  }, [isAuthenticated, user, navigate, location, shouldNavigate, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      setShouldNavigate(true);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      showError('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Show welcome message if already authenticated
  if (isAuthenticated && user) {
    const getDashboardPath = () => {
      if (user.role === 'CUSTOMER') {
        return '/book';
      } else {
        return '/admin';
      }
    };

    return (
      <div className="max-w-md mx-auto p-6 bg-dynamic-surface rounded-lg shadow-md border border-dynamic-border">
        <h2 className="text-2xl font-bold text-center mb-6 text-dynamic-text">
          Welcome back, {user.name}!
        </h2>
        <div className="text-center space-y-2">
          <p className="text-dynamic-text-secondary">Role: {user.role}</p>
          <p className="text-dynamic-text-secondary">Email: {user.email}</p>
          <button
            onClick={() => navigate(getDashboardPath())}
            className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 transition-colors mt-4"
            style={{backgroundColor: '#d34000'}}
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-transparent text-dynamic-text border border-dynamic-border py-2 px-4 rounded-md hover:bg-dynamic-surface transition-colors mt-2"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dynamic-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-dynamic-surface rounded-lg p-8 border border-dynamic-border shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-light text-dynamic-text mb-2">
              5 Nails & Spa - Staff Login
            </h1>
            <p className="text-dynamic-text-secondary text-sm">
              Backend API: {API_CONFIG.BASE_URL}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dynamic-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                  className="w-full px-3 py-2 border border-dynamic-border rounded-md bg-dynamic-background text-dynamic-text placeholder-dynamic-text-secondary focus:outline-none focus:ring-2 focus:ring-dynamic-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dynamic-text mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-dynamic-border rounded-md bg-dynamic-background text-dynamic-text placeholder-dynamic-text-secondary focus:outline-none focus:ring-2 focus:ring-dynamic-primary focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{backgroundColor: '#d34000'}}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

          <div className="mt-8 pt-6 border-t border-dynamic-border">
            <h3 className="text-sm font-medium text-dynamic-text mb-2">API Information</h3>
            <div className="text-xs text-dynamic-text-secondary space-y-1">
              <p><strong>API Mode:</strong> Backend Server</p>
              <p><strong>API URL:</strong> {API_CONFIG.BASE_URL}</p>
              <p><strong>Environment:</strong> {API_CONFIG.IS_PRODUCTION ? 'Production' : 'Development'}</p>
              <p><strong>Auth Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-dynamic-background rounded text-xs text-dynamic-text-secondary">
            <p><strong>Backend API Credentials:</strong></p>
            <p>Use your actual backend credentials</p>
            <p>Backend URL: {API_CONFIG.BASE_URL}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
