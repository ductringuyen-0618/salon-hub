// Mock API service for testing without backend
import { mockApiResponses, simulateApiDelay } from '@/lib/mockData';
import { mockBookings } from '@/lib/bookingData';

// Toggle this to switch between mock and real API
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const mockApi = {
  post: async (url: string, data: any) => {
    await simulateApiDelay(800); // Simulate network delay

    switch (url) {
      case '/auth/login':
        try {
          return mockApiResponses.login(data.email, data.password);
        } catch (error) {
          throw {
            response: {
              data: {
                message: (error as Error).message
              }
            }
          };
        }

      case '/checkin':
        try {
          return mockApiResponses.checkIn(data.email);
        } catch (error) {
          throw {
            response: {
              data: {
                message: 'Check-in failed'
              }
            }
          };
        }

      case '/bookings':
        try {
          // Create new booking
          const newBooking = {
            id: `book-${Date.now()}`,
            ...data,
            status: data.isWalkIn ? 'in-progress' : 'confirmed',
            createdAt: new Date().toISOString()
          };
          return { data: { success: true, booking: newBooking } };
        } catch (error) {
          throw {
            response: {
              data: {
                message: 'Booking failed'
              }
            }
          };
        }

      default:
        throw {
          response: {
            data: {
              message: `Mock API: Endpoint ${url} not implemented`
            }
          }
        };
    }
  },

  get: async (url: string) => {
    await simulateApiDelay(600); // Simulate network delay

    switch (url) {
      case '/checkin/queue':
        return mockApiResponses.getQueue();

      case '/bookings':
        return { data: mockBookings };

      case '/bookings/today':
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = mockBookings.filter(b => b.date === today);
        return { data: todayBookings };

      default:
        throw {
          response: {
            data: {
              message: `Mock API: Endpoint ${url} not implemented`
            }
          }
        };
    }
  },

  put: async (url: string, data: any) => {
    await simulateApiDelay(700);
    // Add mock PUT endpoints as needed
    return { data: { success: true } };
  },

  delete: async (url: string) => {
    await simulateApiDelay(500);
    // Add mock DELETE endpoints as needed
    return { data: { success: true } };
  }
};
