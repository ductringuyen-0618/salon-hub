import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:8082/api';

// Mock data
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'CUSTOMER',
};

export const mockEmployee = {
  id: 1,
  email: 'employee@salon.com',
  name: 'Employee User',
  role: 'FRONT_DESK',
};

export const mockToken = 'mock-jwt-token-for-testing';

export const mockServices = [
  {
    id: 1,
    name: 'Classic Manicure',
    description: 'Traditional manicure with nail shaping and polish',
    duration: 30,
    price: 25.0,
    category: 'Manicure',
    popular: true,
    active: true,
  },
  {
    id: 2,
    name: 'Gel Pedicure',
    description: 'Pedicure with long-lasting gel polish',
    duration: 60,
    price: 55.0,
    category: 'Pedicure',
    popular: true,
    active: true,
  },
  {
    id: 3,
    name: 'Acrylic Full Set',
    description: 'Full set of acrylic nail extensions',
    duration: 90,
    price: 65.0,
    category: 'Nail Enhancements',
    popular: false,
    active: true,
  },
];

export const mockQueueEntries = [
  {
    id: 1,
    customer: { id: 1, name: 'John Doe', email: 'john@example.com' },
    service: { id: 1, name: 'Classic Manicure' },
    status: 'WAITING',
    checkInTime: new Date().toISOString(),
    estimatedWaitTime: 15,
    priority: 1,
  },
  {
    id: 2,
    customer: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    service: { id: 2, name: 'Gel Pedicure' },
    status: 'IN_PROGRESS',
    checkInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    estimatedWaitTime: 0,
    priority: 2,
  },
];

export const mockCustomers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-0100' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-0101' },
];

export const mockAppointments = [
  {
    id: 1,
    customerId: 1,
    employeeId: 1,
    serviceTypeId: 1,
    appointmentDate: '2024-12-20',
    appointmentTime: '10:00',
    status: 'CONFIRMED',
    notes: 'First appointment',
  },
];

// MSW Request Handlers
export const handlers = [
  // Auth endpoints - Returns AuthenticationResponse format
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        access_token: mockToken,
        token_type: 'Bearer',
        name: mockUser.name,
        email: mockUser.email,
        phoneNumber: '555-0100',
        role: mockUser.role,
      });
    }
    
    if (body.email === 'employee@salon.com' && body.password === 'password123') {
      return HttpResponse.json({
        access_token: mockToken,
        token_type: 'Bearer',
        name: mockEmployee.name,
        email: mockEmployee.email,
        phoneNumber: '555-0200',
        role: mockEmployee.role,
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string; name: string; phoneNumber?: string };
    
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      access_token: mockToken,
      token_type: 'Bearer',
      name: body.name,
      email: body.email,
      phoneNumber: body.phoneNumber || '555-0000',
      role: 'CUSTOMER',
    });
  }),

  // Service Types endpoints
  http.get(`${API_URL}/service-types`, () => {
    return HttpResponse.json(mockServices);
  }),

  http.get(`${API_URL}/service-types/:id`, ({ params }) => {
    const service = mockServices.find(s => s.id === Number(params.id));
    if (!service) {
      return HttpResponse.json(
        { message: 'Service not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json(service);
  }),

  http.post(`${API_URL}/service-types`, async ({ request }) => {
    const body = await request.json() as Partial<typeof mockServices[0]>;
    const newService = {
      id: mockServices.length + 1,
      ...body,
    };
    return HttpResponse.json(newService, { status: 201 });
  }),

  // Queue endpoints
  http.get(`${API_URL}/queue`, () => {
    return HttpResponse.json(mockQueueEntries);
  }),

  http.post(`${API_URL}/queue`, async ({ request }) => {
    const body = await request.json() as { customerId: number; serviceId?: number };
    const newEntry = {
      id: mockQueueEntries.length + 1,
      customer: mockCustomers.find(c => c.id === body.customerId) || mockCustomers[0],
      service: body.serviceId ? mockServices.find(s => s.id === body.serviceId) : null,
      status: 'WAITING',
      checkInTime: new Date().toISOString(),
      estimatedWaitTime: 30,
      priority: mockQueueEntries.length + 1,
    };
    return HttpResponse.json(newEntry, { status: 201 });
  }),

  http.patch(`${API_URL}/queue/:id/status`, async ({ params, request }) => {
    const body = await request.json() as { status: string };
    const entry = mockQueueEntries.find(e => e.id === Number(params.id));
    if (!entry) {
      return HttpResponse.json(
        { message: 'Queue entry not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      ...entry,
      status: body.status,
    });
  }),

  // Customer endpoints
  http.get(`${API_URL}/customers`, () => {
    return HttpResponse.json(mockCustomers);
  }),

  http.get(`${API_URL}/customers/:id`, ({ params }) => {
    const customer = mockCustomers.find(c => c.id === Number(params.id));
    if (!customer) {
      return HttpResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json(customer);
  }),

  http.post(`${API_URL}/customers`, async ({ request }) => {
    const body = await request.json() as Partial<typeof mockCustomers[0]>;
    const newCustomer = {
      id: mockCustomers.length + 1,
      ...body,
    };
    return HttpResponse.json(newCustomer, { status: 201 });
  }),

  // Check-in endpoint
  http.post(`${API_URL}/checkin`, async ({ request }) => {
    const body = await request.json() as { name: string; phone?: string; email?: string; serviceId?: number };
    
    // Validate required fields
    if (!body.name) {
      return HttpResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      id: 100,
      queuePosition: mockQueueEntries.length + 1,
      estimatedWaitTime: 25,
      customer: {
        id: 100,
        name: body.name,
        phone: body.phone,
        email: body.email,
      },
      service: body.serviceId ? mockServices.find(s => s.id === body.serviceId) : null,
      checkInTime: new Date().toISOString(),
    });
  }),

  // Appointments endpoints
  http.get(`${API_URL}/appointments`, () => {
    return HttpResponse.json(mockAppointments);
  }),

  http.post(`${API_URL}/appointments`, async ({ request }) => {
    const body = await request.json() as Partial<typeof mockAppointments[0]>;
    const newAppointment = {
      id: mockAppointments.length + 1,
      ...body,
      status: 'CONFIRMED',
    };
    return HttpResponse.json(newAppointment, { status: 201 });
  }),
];
