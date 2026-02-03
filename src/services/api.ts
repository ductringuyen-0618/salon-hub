import { API_CONFIG } from '@/config/api';
import { tokenStorage } from '@/lib/tokenStorage';

// Error response from backend
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  fieldErrors?: {
    field: string;
    message: string;
    rejectedValue?: any;
  }[];
}

// Types based on the backend API
export interface User {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  role: 'ADMIN' | 'MANAGER' | 'FRONT_DESK' | 'TECHNICIAN' | 'CUSTOMER';
  enabled: boolean;
  lastVisit?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  lastVisit?: string;
  notes?: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'ADMIN' | 'MANAGER' | 'FRONT_DESK' | 'TECHNICIAN';
  available: boolean;
  specialties?: string[];
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  estimatedDurationMinutes: number;
  price: number;
  category?: string;
  popular?: boolean;
  active?: boolean;
  // Legacy field mapping for backward compatibility
  duration?: number;
}

export interface Appointment {
  id: number;
  customer: Customer;
  employee: Employee;
  service: Service;
  scheduledTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface QueueEntry {
  id: number;
  customer: Customer;
  service: Service;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedWaitTime: number;
  checkInTime: string;
  priority: number;
  notes?: string;
}

export interface CheckInRequest {
  customerName: string;
  phoneNumber: string;
  email?: string;
  serviceId?: number;
  notes?: string;
}

export interface CheckInRequestDTO {
  name: string;
  phoneNumber?: string;
  email?: string;
  preferredTechnician?: string;
  partySize?: number;
  additionalPeople?: { name: string }[];
  notes?: string;
  requestedService?: string;
  guest?: boolean;
}

export interface BookingData {
  customerId?: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: number;
  serviceName: string;
  staffId: number;
  staffName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  price: number;
  notes?: string;
  status: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface CheckInResponseDTO {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  note?: string;
  guest: boolean;
  checkedInAt: string;
  message: string;
  success: boolean;
  estimatedWaitTime: number;
  queuePosition: number;
  queueId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  role: 'ADMIN' | 'MANAGER' | 'FRONT_DESK' | 'TECHNICIAN' | 'CUSTOMER';
}

export interface AuthenticationResponse {
  access_token: string;
  token_type: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'ADMIN' | 'MANAGER' | 'FRONT_DESK' | 'TECHNICIAN' | 'CUSTOMER';
  lastVisit?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = tokenStorage.getAccessToken();
    if (token && !tokenStorage.isTokenExpired()) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // Clear invalid session
        tokenStorage.clearSession();
        
        // Try to get error message from response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json() as ApiErrorResponse;
          throw new Error(errorData.message || `Authentication failed: ${response.status} ${response.statusText}`);
        }
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }
      
      if (!response.ok) {
        // Try to get error message from response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json() as ApiErrorResponse;
          throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Public request method (no authentication required)
  private async publicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Try to get error message from response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json() as ApiErrorResponse;
          throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      console.error('Public API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthenticationResponse> {
    // Login is a public endpoint - no auth required
    const response = await this.publicRequest<AuthenticationResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthenticationResponse> {
    // Register is a public endpoint - no auth required
    const response = await this.publicRequest<AuthenticationResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return response;
  }

  async getCurrentUser(): Promise<AuthenticationResponse> {
    return this.request<AuthenticationResponse>('/auth/me');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return tokenStorage.hasValidSession();
  }

  // Get current user from storage
  getCurrentUserFromStorage() {
    return tokenStorage.getUser();
  }

  // Logout (clear tokens)
  logout(): void {
    tokenStorage.clearSession();
  }

  // Customer endpoints
  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/customers');
  }

  async getCustomerById(id: number): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  async getCustomerByEmail(email: string): Promise<Customer> {
    return this.request<Customer>(`/customers?email=${encodeURIComponent(email)}`);
  }

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: number): Promise<void> {
    return this.request<void>(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Employee endpoints
  async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>('/employees');
  }

  async getEmployeeById(id: number): Promise<Employee> {
    return this.request<Employee>(`/employees/${id}`);
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    return this.request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee> {
    return this.request<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
  }

  async deleteEmployee(id: number): Promise<void> {
    return this.request<void>(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async updateEmployeeAvailability(id: number, available: boolean): Promise<void> {
    return this.request<void>(`/employees/${id}/availability?available=${available}`, {
      method: 'PATCH',
    });
  }

  // Appointment endpoints
  async getAppointmentById(id: number): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}`);
  }

  async getAppointmentsByCustomer(customerId: number): Promise<Appointment[]> {
    return this.request<Appointment[]>(`/appointments/customer/${customerId}`);
  }

  async getAppointmentsByEmployee(employeeId: number): Promise<Appointment[]> {
    return this.request<Appointment[]>(`/appointments/employee/${employeeId}`);
  }

  async createAppointment(bookingData: BookingData): Promise<ApiResponse<Appointment>> {
    try {
      const appointmentRequest = {
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName,
        staffId: bookingData.staffId,
        staffName: bookingData.staffName,
        scheduledTime: `${bookingData.appointmentDate}T${bookingData.appointmentTime}:00`,
        duration: bookingData.duration,
        price: bookingData.price,
        notes: bookingData.notes || '',
        status: bookingData.status
      };

      const appointment = await this.request<Appointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentRequest),
      });
      
      return {
        success: true,
        message: 'Appointment created successfully',
        data: appointment
      };
    } catch (error) {
      console.error('Create appointment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create appointment'
      };
    }
  }

  async updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    });
  }

  async updateAppointmentStatus(id: number, status: Appointment['status']): Promise<Appointment> {
    return this.request<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteAppointment(id: number): Promise<void> {
    return this.request<void>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Queue endpoints
  async getQueue(): Promise<QueueEntry[]> {
    return this.request<QueueEntry[]>('/queue');
  }

  async getQueueEntry(id: number): Promise<QueueEntry> {
    return this.request<QueueEntry>(`/queue/${id}`);
  }

  async updateQueueEntry(id: number, entry: Partial<QueueEntry>): Promise<QueueEntry> {
    return this.request<QueueEntry>(`/queue/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async updateQueueStatus(id: number, status: QueueEntry['status']): Promise<QueueEntry> {
    return this.request<QueueEntry>(`/queue/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async removeFromQueue(id: number): Promise<void> {
    return this.request<void>(`/queue/${id}`, {
      method: 'DELETE',
    });
  }

  async getQueueStats(): Promise<{ totalWaiting: number; averageWaitTime: number }> {
    return this.request<{ totalWaiting: number; averageWaitTime: number }>('/queue/stats');
  }

  async refreshQueue(): Promise<void> {
    return this.request<void>('/queue/refresh', {
      method: 'POST',
    });
  }

  // Check-in endpoints (requires authentication)
  async checkIn(checkInData: CheckInRequestDTO): Promise<CheckInResponseDTO> {
    try {
      // Step 1: Create or get customer
      const customerData = {
        name: checkInData.name,
        phoneNumber: checkInData.phoneNumber || '',
        email: checkInData.email || ''
      };
      
      const customer = await this.request<Customer>('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData),
      });

      // Step 2: Add customer to queue (for now, return mock response)
      // We'll need to find the correct queue endpoint
      const mockResponse: CheckInResponseDTO = {
        id: customer.id,
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        email: customer.email || '',
        note: checkInData.notes || '',
        guest: true,
        checkedInAt: new Date().toISOString(),
        message: 'Successfully checked in',
        success: true,
        estimatedWaitTime: 25,
        queuePosition: 1,
        queueId: Date.now() // Mock queue ID
      };

      return mockResponse;
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  }

  async checkInExisting(phoneOrEmail: string): Promise<Customer> {
    return this.request<Customer>(`/checkin/existing?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}`, {
      method: 'POST',
    });
  }

  async checkInGuest(name: string, phoneNumber: string): Promise<Customer> {
    return this.request<Customer>(`/checkin/guest?name=${encodeURIComponent(name)}&phoneNumber=${encodeURIComponent(phoneNumber)}`, {
      method: 'POST',
    });
  }

  async getTodaysGuests(): Promise<QueueEntry[]> {
    return this.request<QueueEntry[]>('/checkin/guests/today');
  }

  // Services endpoints (service-types in backend)
  async getServices(): Promise<Service[]> {
    const services = await this.publicRequest<Service[]>('/service-types');
    // Map backend field names to frontend expectations
    return services.map(s => ({
      ...s,
      duration: s.estimatedDurationMinutes || s.duration
    }));
  }

  async getServiceById(id: number): Promise<Service> {
    const service = await this.publicRequest<Service>(`/service-types/${id}`);
    return {
      ...service,
      duration: service.estimatedDurationMinutes || service.duration
    };
  }

  async createService(service: Omit<Service, 'id'>): Promise<Service> {
    return this.request<Service>('/service-types', {
      method: 'POST',
      body: JSON.stringify({
        ...service,
        estimatedDurationMinutes: service.estimatedDurationMinutes || service.duration
      }),
    });
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service> {
    return this.request<Service>(`/service-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...service,
        estimatedDurationMinutes: service.estimatedDurationMinutes || service.duration
      }),
    });
  }

  async deleteService(id: number): Promise<void> {
    return this.request<void>(`/service-types/${id}`, {
      method: 'DELETE',
    });
  }

  // Get services by category
  async getServicesByCategory(category: string): Promise<Service[]> {
    const services = await this.getServices();
    return services.filter(s => s.category === category && s.active !== false);
  }

  // Get popular services
  async getPopularServices(): Promise<Service[]> {
    const services = await this.getServices();
    return services.filter(s => s.popular === true && s.active !== false);
  }

  // Utility methods
  getToken(): string | null {
    return tokenStorage.getAccessToken();
  }
}

export const apiService = new ApiService();