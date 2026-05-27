// Mock data for testing without backend

export interface MockUser {
  id: number;
  email: string;
  name: string;
  password: string;
  role: 'CUSTOMER' | 'ADMIN' | 'EMPLOYEE';
  phoneNumber?: string;
  preferredServices?: string;
  lastVisit?: string;
}

export interface MockCustomer {
  id: number;
  name: string;
  contact: string;
  inStore: boolean;
  estimatedWaitTime: number;
  checkInTime: string;
  requestedService: string;
}

// Mock users for testing
export const mockUsers: MockUser[] = [
  {
    id: 1,
    email: 'admin@salonhub.com',
    name: 'Admin User',
    password: 'admin123',
    role: 'ADMIN',
    phoneNumber: '555-0001',
    preferredServices: 'Full Set, Pedicure',
    lastVisit: '2024-06-15T10:30:00'
  },
  {
    id: 2,
    email: 'john@example.com',
    name: 'John Doe',
    password: 'password123',
    role: 'CUSTOMER',
    phoneNumber: '555-0002',
    preferredServices: 'Manicure, Nail Art',
    lastVisit: '2024-06-10T14:15:00'
  },
  {
    id: 3,
    email: 'jane@example.com',
    name: 'Jane Smith',
    password: 'password123',
    role: 'CUSTOMER',
    phoneNumber: '555-0003',
    preferredServices: 'Pedicure, Massage',
    lastVisit: '2024-06-12T16:45:00'
  },
  {
    id: 4,
    email: 'employee@salonhub.com',
    name: 'Employee User',
    password: 'employee123',
    role: 'EMPLOYEE',
    phoneNumber: '555-0004',
    preferredServices: '',
    lastVisit: '2024-06-16T09:00:00'
  },
  {
    id: 5,
    email: 'sarah@example.com',
    name: 'Sarah Wilson',
    password: 'password123',
    role: 'CUSTOMER',
    phoneNumber: '555-0005',
    preferredServices: 'Full Set, Gel Polish',
    lastVisit: '2024-06-08T11:20:00'
  }
];

// Mock customers in queue
export const mockCustomersQueue: MockCustomer[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    contact: '555-1001',
    inStore: false,
    estimatedWaitTime: 15,
    checkInTime: '2024-06-17T10:30:00',
    requestedService: 'Manicure'
  },
  {
    id: 2,
    name: 'Bob Brown',
    contact: '555-1002',
    inStore: true,
    estimatedWaitTime: 25,
    checkInTime: '2024-06-17T10:45:00',
    requestedService: 'Pedicure'
  },
  {
    id: 3,
    name: 'Carol Davis',
    contact: '555-1003',
    inStore: false,
    estimatedWaitTime: 35,
    checkInTime: '2024-06-17T11:00:00',
    requestedService: 'Full Set'
  },
  {
    id: 4,
    name: 'David Miller',
    contact: '555-1004',
    inStore: true,
    estimatedWaitTime: 20,
    checkInTime: '2024-06-17T11:15:00',
    requestedService: 'Manicure & Pedicure'
  },
  {
    id: 5,
    name: 'Eva Garcia',
    contact: '555-1005',
    inStore: false,
    estimatedWaitTime: 30,
    checkInTime: '2024-06-17T11:30:00',
    requestedService: 'Nail Art'
  }
];

// Mock API responses
export const mockApiResponses = {
  login: (email: string, password: string) => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return {
      data: {
        accessToken: `mock-token-${user.id}-${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          preferredServices: user.preferredServices,
          lastVisit: user.lastVisit
        }
      }
    };
  },

  checkIn: (email: string) => {
    // Simulate successful check-in
    return {
      data: {
        success: true,
        message: 'Check-in successful',
        estimatedWaitTime: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
        queuePosition: Math.floor(Math.random() * 5) + 1
      }
    };
  },

  getQueue: () => {
    return {
      data: mockCustomersQueue
    };
  },

  createBooking: (bookingData: any) => {
    return {
      data: {
        success: true,
        booking: {
          id: `book-${Date.now()}`,
          ...bookingData,
          status: bookingData.isWalkIn ? 'in-progress' : 'confirmed',
          createdAt: new Date().toISOString()
        }
      }
    };
  }
};

// Utility function to simulate API delay
export const simulateApiDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
