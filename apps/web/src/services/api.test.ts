import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock tokenStorage - must use inline object for hoisting
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
}));

// Import after mock setup
import { apiService } from '@/services/api';
import { tokenStorage } from '@/lib/tokenStorage';

const API_URL = 'http://localhost:8082/api';

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tokenStorage).getAccessToken.mockReturnValue(null);
    vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    describe('login', () => {
      it('should successfully login with valid credentials', async () => {
        const response = await apiService.login({
          email: 'test@example.com',
          password: 'password123',
        });

        expect(response).toMatchObject({
          email: 'test@example.com',
          name: 'Test User',
          role: 'CUSTOMER',
        });
        expect(response.access_token).toBeDefined();
      });

      it('should throw error on invalid credentials', async () => {
        await expect(
          apiService.login({
            email: 'invalid@example.com',
            password: 'wrongpassword',
          })
        ).rejects.toThrow();
      });

      it('should throw on network error', async () => {
        server.use(
          http.post(`${API_URL}/auth/login`, () => {
            return HttpResponse.error();
          })
        );

        await expect(
          apiService.login({
            email: 'test@example.com',
            password: 'password123',
          })
        ).rejects.toThrow();
      });
    });

    describe('register', () => {
      it('should successfully register a new user', async () => {
        const response = await apiService.register({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
          phoneNumber: '555-0199',
          role: 'CUSTOMER',
        });

        expect(response).toBeDefined();
      });

      it('should throw error on duplicate email', async () => {
        await expect(
          apiService.register({
            email: 'existing@example.com',
            password: 'password123',
            name: 'Existing User',
            phoneNumber: '555-0100',
            role: 'CUSTOMER',
          })
        ).rejects.toThrow();
      });
    });

    describe('getCurrentUser', () => {
      it('should fetch current user with valid token', async () => {
        vi.mocked(tokenStorage).getAccessToken.mockReturnValue('valid-token');
        vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(false);

        server.use(
          http.get(`${API_URL}/auth/me`, () => {
            return HttpResponse.json({
              access_token: 'token',
              token_type: 'Bearer',
              email: 'current@example.com',
              name: 'Current User',
              phoneNumber: '555-0100',
              role: 'MANAGER',
            });
          })
        );

        const response = await apiService.getCurrentUser();
        expect(response.email).toBe('current@example.com');
        expect(response.role).toBe('MANAGER');
      });
    });
  });

  describe('Authorization Headers', () => {
    it('should include auth header when token is valid', async () => {
      vi.mocked(tokenStorage).getAccessToken.mockReturnValue('test-token-123');
      vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(false);

      let capturedHeaders: Headers | undefined;
      
      server.use(
        http.get(`${API_URL}/customers`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json([]);
        })
      );

      await apiService.getCustomers();

      expect(capturedHeaders?.get('Authorization')).toBe('Bearer test-token-123');
    });

    it('should not include auth header when token is expired', async () => {
      vi.mocked(tokenStorage).getAccessToken.mockReturnValue('expired-token');
      vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(true);

      let capturedHeaders: Headers | undefined;
      
      server.use(
        http.get(`${API_URL}/customers`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json([]);
        })
      );

      await apiService.getCustomers();

      expect(capturedHeaders?.get('Authorization')).toBeNull();
    });

    it('should clear session on 401 response', async () => {
      vi.mocked(tokenStorage).getAccessToken.mockReturnValue('invalid-token');
      vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(false);

      server.use(
        http.get(`${API_URL}/customers`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(apiService.getCustomers()).rejects.toThrow('Authentication failed');
      expect(vi.mocked(tokenStorage).clearSession).toHaveBeenCalled();
    });

    it('should clear session on 403 response', async () => {
      vi.mocked(tokenStorage).getAccessToken.mockReturnValue('forbidden-token');
      vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(false);

      server.use(
        http.get(`${API_URL}/customers`, () => {
          return HttpResponse.json(
            { message: 'Forbidden' },
            { status: 403 }
          );
        })
      );

      await expect(apiService.getCustomers()).rejects.toThrow('Authentication failed');
      expect(vi.mocked(tokenStorage).clearSession).toHaveBeenCalled();
    });
  });

  describe('Service Types API', () => {
    it('should fetch all service types', async () => {
      const services = await apiService.getServices();

      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
      expect(services[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        price: expect.any(Number),
      });
    });

    it('should fetch service by ID', async () => {
      const service = await apiService.getServiceById(1);

      expect(service).toMatchObject({
        id: 1,
        name: 'Classic Manicure',
        price: 25.0,
      });
    });

    it('should throw error for non-existent service', async () => {
      await expect(apiService.getServiceById(9999)).rejects.toThrow();
    });

    it('should create a new service', async () => {
      vi.mocked(tokenStorage).getAccessToken.mockReturnValue('admin-token');
      vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(false);

      const newService = await apiService.createService({
        name: 'New Service',
        estimatedDurationMinutes: 45,
        price: 35.0,
        category: 'Test',
        popular: false,
        active: true,
      });

      expect(newService).toMatchObject({
        name: 'New Service',
        price: 35.0,
      });
    });
  });

  describe('Queue API', () => {
    it('should fetch queue entries', async () => {
      vi.mocked(tokenStorage).getAccessToken.mockReturnValue('staff-token');
      vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(false);

      const queue = await apiService.getQueue();

      expect(Array.isArray(queue)).toBe(true);
      expect(queue[0]).toMatchObject({
        id: expect.any(Number),
        status: expect.stringMatching(/WAITING|IN_PROGRESS|COMPLETED|CANCELLED/),
      });
    });

    it('should update queue entry status', async () => {
      vi.mocked(tokenStorage).getAccessToken.mockReturnValue('staff-token');
      vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(false);

      const updated = await apiService.updateQueueStatus(1, 'IN_PROGRESS');

      expect(updated.status).toBe('IN_PROGRESS');
    });
  });

  describe('Check-in API', () => {
    it('should successfully check in a customer', async () => {
      const checkInData = {
        name: 'Walk-in Customer',
        phoneNumber: '555-0123',
        email: 'walkin@example.com',
        requestedService: 'Manicure',
        guest: true,
      };

      const response = await apiService.checkIn(checkInData);

      expect(response).toMatchObject({
        queuePosition: expect.any(Number),
        estimatedWaitTime: expect.any(Number),
      });
    });

    it('should throw error when customer creation fails', async () => {
      // The checkIn method calls /customers first, so we override that endpoint
      server.use(
        http.post(`${API_URL}/customers`, () => {
          return HttpResponse.json(
            { message: 'Invalid customer data' },
            { status: 400 }
          );
        })
      );

      await expect(
        apiService.checkIn({
          name: 'Invalid',
          guest: true,
        })
      ).rejects.toThrow();
    });
  });

  describe('Customer API', () => {
    beforeEach(() => {
      vi.mocked(tokenStorage).getAccessToken.mockReturnValue('staff-token');
      vi.mocked(tokenStorage).isTokenExpired.mockReturnValue(false);
    });

    it('should fetch all customers', async () => {
      const customers = await apiService.getCustomers();

      expect(Array.isArray(customers)).toBe(true);
      expect(customers[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
      });
    });

    it('should fetch customer by ID', async () => {
      const customer = await apiService.getCustomerById(1);

      expect(customer).toMatchObject({
        id: 1,
        name: 'John Doe',
      });
    });

    it('should create a new customer', async () => {
      const newCustomer = await apiService.createCustomer({
        name: 'New Customer',
        email: 'newcustomer@example.com',
        phoneNumber: '555-0200',
      });

      expect(newCustomer).toMatchObject({
        name: 'New Customer',
        email: 'newcustomer@example.com',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      server.use(
        http.get(`${API_URL}/service-types`, () => {
          return HttpResponse.error();
        })
      );

      await expect(apiService.getServices()).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      server.use(
        http.get(`${API_URL}/service-types`, () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      await expect(apiService.getServices()).rejects.toThrow('API Error: 500');
    });

    it('should handle empty response', async () => {
      server.use(
        http.delete(`${API_URL}/customers/1`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      // Should not throw on empty response
      await expect(apiService.deleteCustomer(1)).resolves.toBeDefined();
    });
  });

  describe('Utility Methods', () => {
    it('isAuthenticated should return true when valid session exists', () => {
      vi.mocked(tokenStorage).hasValidSession.mockReturnValue(true);
      
      expect(apiService.isAuthenticated()).toBe(true);
    });

    it('isAuthenticated should return false when no valid session', () => {
      vi.mocked(tokenStorage).hasValidSession.mockReturnValue(false);
      
      expect(apiService.isAuthenticated()).toBe(false);
    });

    it('logout should clear session', () => {
      apiService.logout();
      
      expect(vi.mocked(tokenStorage).clearSession).toHaveBeenCalled();
    });

    it('getCurrentUserFromStorage should return stored user', () => {
      const mockUser = {
        email: 'stored@example.com',
        name: 'Stored User',
        role: 'CUSTOMER' as const,
        phoneNumber: '555-1234',
      };
      vi.mocked(tokenStorage).getUser.mockReturnValue(mockUser);

      const user = apiService.getCurrentUserFromStorage();
      
      expect(user).toEqual(mockUser);
    });
  });
});
