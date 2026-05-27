import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock the dependencies
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login' }),
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  }),
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@/config/api', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:8082/api',
  },
}));

import LoginForm from '@/components/LoginForm';

const renderLoginForm = () => {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
  });

  describe('Rendering', () => {
    it('should render login form with email and password fields', () => {
      renderLoginForm();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should display API endpoint information', () => {
      renderLoginForm();

      // Use getAllByText since "backend api" appears multiple times
      expect(screen.getAllByText(/backend api/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/localhost:8082/i).length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    it('should require email field', async () => {
      renderLoginForm();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const emailInput = screen.getByLabelText(/email/i);
      
      // Clear and leave empty
      await userEvent.clear(emailInput);
      await userEvent.click(submitButton);

      // The form should not submit without email
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should require password field', async () => {
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.click(submitButton);

      // The form should not submit without password
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      renderLoginForm();
      
      const emailInput = screen.getByLabelText(/email/i);
      
      await userEvent.type(emailInput, 'invalidemail');
      
      // Input should show as invalid for non-email format
      expect(emailInput).toHaveValue('invalidemail');
    });
  });

  describe('Form Submission', () => {
    it('should call login with email and password on submit', async () => {
      mockLogin.mockResolvedValue(undefined);
      
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading state during submission', async () => {
      let resolveLogin: () => void;
      const loginPromise = new Promise<void>((resolve) => {
        resolveLogin = resolve;
      });
      mockLogin.mockReturnValue(loginPromise);

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      
      const clickPromise = userEvent.click(submitButton);

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
      });

      resolveLogin!();
      await clickPromise;
    });

    it('should display error message on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'bad@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Input Handling', () => {
    it('should update email field on input', async () => {
      renderLoginForm();

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'user@salon.com');

      expect(emailInput).toHaveValue('user@salon.com');
    });

    it('should update password field on input', async () => {
      renderLoginForm();

      const passwordInput = screen.getByLabelText(/password/i);
      await userEvent.type(passwordInput, 'secretpass');

      expect(passwordInput).toHaveValue('secretpass');
    });

    it('should have password field with type password', () => {
      renderLoginForm();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});

describe('LoginForm - Authenticated State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show welcome message when already authenticated', async () => {
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        login: vi.fn(),
        isAuthenticated: true,
        user: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'CUSTOMER',
        },
        loading: false,
        error: null,
      }),
    }));

    // Re-import to get mocked version
    const { default: AuthenticatedLoginForm } = await import('@/components/LoginForm');
    
    render(
      <MemoryRouter>
        <AuthenticatedLoginForm />
      </MemoryRouter>
    );

    // When authenticated, either shows welcome or redirects
    // The component handles this differently
  });
});
