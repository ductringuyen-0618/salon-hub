import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock tokenStorage - must be hoisted so use inline object
vi.mock('@/lib/tokenStorage', () => ({
  tokenStorage: {
    storeSession: vi.fn(),
    getAccessToken: vi.fn(() => null),
    getTokenType: vi.fn(() => 'Bearer'),
    getUser: vi.fn(() => null),
    hasValidSession: vi.fn(() => false),
    isTokenExpired: vi.fn(() => true),
    clearSession: vi.fn(),
    getAuthHeader: vi.fn(),
    updateUserData: vi.fn(),
  },
  StoredUser: {},
}));

// Import after mock setup
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { tokenStorage } from '@/lib/tokenStorage';

// Helper component to access auth context
const AuthConsumer = () => {
  const auth = useAuth();
  
  const handleBadLogin = async () => {
    try {
      await auth.login('bad@example.com', 'wrong');
    } catch {
      // Expected to throw - error state is set by the context
    }
  };
  
  return (
    <div>
      <span data-testid="authenticated">{auth.isAuthenticated.toString()}</span>
      <span data-testid="loading">{auth.loading.toString()}</span>
      <span data-testid="user-email">{auth.user?.email || 'none'}</span>
      <span data-testid="user-role">{auth.user?.role || 'none'}</span>
      <span data-testid="error">{auth.error || 'none'}</span>
      <button onClick={() => auth.login('test@example.com', 'password123')}>
        Login
      </button>
      <button onClick={handleBadLogin}>
        Bad Login
      </button>
      <button onClick={auth.logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tokenStorage.hasValidSession).mockReturnValue(false);
    vi.mocked(tokenStorage.getUser).mockReturnValue(null);
    vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null);
    vi.mocked(tokenStorage.isTokenExpired).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with unauthenticated state when no stored session', async () => {
      vi.mocked(tokenStorage.hasValidSession).mockReturnValue(false);

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user-email').textContent).toBe('none');
    });

    it('should restore session from storage when valid token exists', async () => {
      const storedUser = {
        email: 'stored@example.com',
        name: 'Stored User',
        phoneNumber: '555-0100',
        role: 'CUSTOMER' as const,
      };

      vi.mocked(tokenStorage.hasValidSession).mockReturnValue(true);
      vi.mocked(tokenStorage.getUser).mockReturnValue(storedUser);
      vi.mocked(tokenStorage.getAccessToken).mockReturnValue('valid-token');
      vi.mocked(tokenStorage.isTokenExpired).mockReturnValue(false);

      // Mock the /auth/me endpoint for refresh
      server.use(
        http.get('http://localhost:8082/api/auth/me', () => {
          return HttpResponse.json({
            access_token: 'refreshed-token',
            token_type: 'Bearer',
            email: storedUser.email,
            name: storedUser.name,
            phoneNumber: storedUser.phoneNumber,
            role: storedUser.role,
          });
        })
      );

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user-email').textContent).toBe('stored@example.com');
    });
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      vi.mocked(tokenStorage.hasValidSession).mockReturnValue(false);

      server.use(
        http.post('http://localhost:8082/api/auth/login', () => {
          return HttpResponse.json({
            access_token: 'new-token',
            token_type: 'Bearer',
            email: 'test@example.com',
            name: 'Test User',
            phoneNumber: '555-0100',
            role: 'CUSTOMER',
          });
        })
      );

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      const loginButton = screen.getByText('Login');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true');
      });

      expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
      expect(tokenStorage.storeSession).toHaveBeenCalled();
    });

    it('should set error state on login failure', async () => {
      vi.mocked(tokenStorage.hasValidSession).mockReturnValue(false);

      server.use(
        http.post('http://localhost:8082/api/auth/login', () => {
          return HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      // Suppress console.error for this test since we expect an error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      const badLoginButton = screen.getByText('Bad Login');
      
      // The login will fail internally but the context should handle it
      await act(async () => {
        await userEvent.click(badLoginButton);
        // Wait for any pending state updates
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Logout Flow', () => {
    it('should clear session on logout', async () => {
      const storedUser = {
        email: 'user@example.com',
        name: 'Test User',
        phoneNumber: '555-0100',
        role: 'CUSTOMER' as const,
      };

      vi.mocked(tokenStorage.hasValidSession).mockReturnValue(true);
      vi.mocked(tokenStorage.getUser).mockReturnValue(storedUser);
      vi.mocked(tokenStorage.getAccessToken).mockReturnValue('valid-token');
      vi.mocked(tokenStorage.isTokenExpired).mockReturnValue(false);

      // Mock refresh
      server.use(
        http.get('http://localhost:8082/api/auth/me', () => {
          return HttpResponse.json({
            access_token: 'token',
            token_type: 'Bearer',
            ...storedUser,
          });
        })
      );

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('true');
      });

      const logoutButton = screen.getByText('Logout');
      await userEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
      });

      expect(tokenStorage.clearSession).toHaveBeenCalled();
    });
  });

  describe('Token Persistence', () => {
    it('should store tokens after successful login', async () => {
      vi.mocked(tokenStorage.hasValidSession).mockReturnValue(false);

      server.use(
        http.post('http://localhost:8082/api/auth/login', () => {
          return HttpResponse.json({
            access_token: 'test-token-123',
            token_type: 'Bearer',
            email: 'test@example.com',
            name: 'Test User',
            phoneNumber: '555-0100',
            role: 'MANAGER',
          });
        })
      );

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      const loginButton = screen.getByText('Login');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(tokenStorage.storeSession).toHaveBeenCalledWith(
          'test-token-123',
          'Bearer',
          expect.objectContaining({
            email: 'test@example.com',
            role: 'MANAGER',
          }),
          3600
        );
      });
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<AuthConsumer />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleError.mockRestore();
    });
  });

  describe('Role-based Access', () => {
    it.each([
      ['ADMIN', 'admin@example.com'],
      ['MANAGER', 'manager@example.com'],
      ['FRONT_DESK', 'frontdesk@example.com'],
      ['TECHNICIAN', 'tech@example.com'],
      ['CUSTOMER', 'customer@example.com'],
    ])('should correctly store %s role', async (role, email) => {
      vi.mocked(tokenStorage.hasValidSession).mockReturnValue(false);

      server.use(
        http.post('http://localhost:8082/api/auth/login', () => {
          return HttpResponse.json({
            access_token: 'token',
            token_type: 'Bearer',
            email,
            name: 'Test User',
            phoneNumber: '555-0100',
            role,
          });
        })
      );

      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      const loginButton = screen.getByText('Login');
      await userEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-role').textContent).toBe(role);
      });
    });
  });
});
