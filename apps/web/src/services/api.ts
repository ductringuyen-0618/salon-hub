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
  email?: string;
  phoneNumber?: string;
  note?: string;
  // Legacy fields for backward compatibility
  lastVisit?: string;
  notes?: string;
}

export interface Employee {
  id: number;
  name: string;
  available: boolean;
  role: 'ADMIN' | 'MANAGER' | 'FRONT_DESK' | 'TECHNICIAN';
  // Optional fields that frontend might use
  email?: string;
  phoneNumber?: string;
  specialties?: string[];
}

export interface EmployeeAvailability {
  employeeId: number;
  date: string; // yyyy-MM-dd
  busy: Array<{
    startTime: string;     // ISO LocalDateTime, e.g. "2026-06-02T10:00:00"
    endTime: string;       // ISO LocalDateTime
    appointmentId: number;
  }>;
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
  customerId: number;
  employeeId?: number;
  services: ServiceTypeResponse[];
  totalEstimatedDuration?: number;
  startTime: string;
  actualEndTime?: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  // Legacy fields for backward compatibility with UI components
  customer?: Customer;
  employee?: Employee;
  service?: Service;
  scheduledTime?: string;
  notes?: string;
}

// Backend ServiceType response format
export interface ServiceTypeResponse {
  id: number;
  name: string;
  description?: string;
  estimatedDurationMinutes: number;
  price: number;
}

export interface QueueEntry {
  id: number;
  queueNumber: number;
  customerId: number;
  employeeId?: number;
  appointmentId?: number;
  estimatedWaitTime: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  position: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  // Customer information (populated from customer entity)
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  // Employee information (populated from employee entity)
  employeeName?: string;
  // Legacy fields for backward compatibility
  customer?: Customer;
  service?: Service;
  checkInTime?: string;
  priority?: number;
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
  /** @deprecated use preferredTechnicianId */
  preferredTechnician?: string;
  /** Numeric Employee.id of the customer's preferred technician (server uses this). */
  preferredTechnicianId?: number | null;
  /** Numeric ServiceType.id of the requested service (server uses real duration). */
  serviceTypeId?: number | null;
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

  /**
   * Resolve the tenant slug for the current request. We prefer an explicit
   * VITE_TENANT_SLUG (useful for dev), fall back to the first subdomain
   * label in prod (e.g. `lisa.salon-hub.app` → `lisa`), and use "default"
   * as the final fallback so existing single-tenant deployments keep
   * working unchanged.
   */
  private resolveTenantSlug(): string {
    const explicit = (import.meta as any).env?.VITE_TENANT_SLUG;
    if (explicit) return String(explicit);
    if (typeof window !== 'undefined' && window.location?.hostname) {
      const host = window.location.hostname;
      const parts = host.split('.');
      // Treat first label as tenant slug only when there are 3+ labels and
      // it isn't a known non-tenant prefix.
      if (parts.length >= 3 && !['www', 'api'].includes(parts[0])) {
        return parts[0];
      }
    }
    return 'default';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // Tenant slug header — backend's TenantResolutionFilter uses this
        // to scope every query by tenant_id.
        'X-Tenant-Slug': this.resolveTenantSlug(),
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

        // Always include a stable "Authentication failed: <status>" prefix so
        // callers (and tests) can pattern-match without depending on the
        // backend's specific message text.
        const contentType = response.headers.get('content-type');
        let detail = response.statusText;
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json() as ApiErrorResponse;
            if (errorData.message) detail = errorData.message;
          } catch { /* ignore body parse errors */ }
        }
        throw new Error(`Authentication failed: ${response.status} - ${detail}`);
      }

      if (!response.ok) {
        // Always prefix with "API Error: <status>" for consistent logging.
        const contentType = response.headers.get('content-type');
        let detail = response.statusText;
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json() as ApiErrorResponse;
            if (errorData.message) detail = errorData.message;
          } catch { /* ignore body parse errors */ }
        }
        throw new Error(`API Error: ${response.status} - ${detail}`);
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
        // Same tenant scoping as authenticated requests — anonymous
        // walk-ins still join the right tenant's queue.
        'X-Tenant-Slug': this.resolveTenantSlug(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Always prefix with "API Error: <status>" for consistent logging.
        const contentType = response.headers.get('content-type');
        let detail = response.statusText;
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json() as ApiErrorResponse;
            if (errorData.message) detail = errorData.message;
          } catch { /* ignore body parse errors */ }
        }
        throw new Error(`API Error: ${response.status} - ${detail}`);
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

  // Employee endpoints (public - used for technician selection)
  async getEmployees(): Promise<Employee[]> {
    return this.publicRequest<Employee[]>('/employees');
  }

  /** Public — business settings (name, hours, contact, theme) so the
   *  storefront can render correctly on first paint. */
  async getSettings(): Promise<any> {
    return this.publicRequest<any>('/settings');
  }

  /** Public — check if a tenant slug is available (signup-form live check). */
  async checkTenantSlug(slug: string): Promise<{ slug: string; available: boolean }> {
    return this.publicRequest(`/tenants/check-slug?slug=${encodeURIComponent(slug)}`);
  }

  /** Public — create a new tenant + first admin user (onboarding). */
  async createTenant(payload: {
    businessName: string;
    slug: string;
    adminEmail: string;
    adminPassword: string;
    adminName?: string;
  }): Promise<{ tenantId: number; slug: string; businessName: string; adminEmail: string; adminReady: boolean }> {
    return this.publicRequest('/tenants', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** ADMIN — updates the singleton business settings row. */
  async updateSettings(payload: any): Promise<any> {
    return this.request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetch the busy windows for an employee on a specific day. Public — the
   * booking wizard uses this to disable time slots that already conflict
   * with an existing appointment for the chosen technician.
   */
  async getEmployeeAvailability(employeeId: number, date: string): Promise<EmployeeAvailability> {
    return this.publicRequest<EmployeeAvailability>(
      `/employees/${employeeId}/availability?date=${encodeURIComponent(date)}`
    );
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
      // Build the booking request to match backend BookingRequestDTO.
      // staffId is optional (null = any available). serviceIds carries
      // multi-service bookings; serviceId is the primary.
      const bookingRequest: any = {
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        serviceId: bookingData.serviceId,
        scheduledTime: `${bookingData.appointmentDate}T${bookingData.appointmentTime}:00`,
        duration: bookingData.duration,
        price: bookingData.price,
        notes: bookingData.notes || '',
        status: bookingData.status,
      };
      if ((bookingData as any).serviceIds && (bookingData as any).serviceIds.length > 1) {
        bookingRequest.serviceIds = (bookingData as any).serviceIds;
      }
      if (bookingData.staffId != null) {
        bookingRequest.staffId = bookingData.staffId;
        if (bookingData.staffName) bookingRequest.staffName = bookingData.staffName;
      }

      // Use /api/bookings endpoint which accepts customer info directly
      const appointment = await this.publicRequest<Appointment>('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingRequest),
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
    // Backend expects status as query param, not JSON body
    return this.request<QueueEntry>(`/queue/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  }

  async removeFromQueue(id: number): Promise<void> {
    return this.request<void>(`/queue/${id}`, {
      method: 'DELETE',
    });
  }

  async getQueueStats(): Promise<{ totalWaiting: number; averageWaitTime: number; longestWait?: number }> {
    // Public endpoint - used by check-in page to show wait times
    return this.publicRequest<{ totalWaiting: number; averageWaitTime: number; longestWait?: number }>('/queue/stats');
  }

  async refreshQueue(): Promise<void> {
    return this.request<void>('/queue/refresh', {
      method: 'POST',
    });
  }

  // Check-in endpoints (public - for customer self-service kiosk)
  async checkIn(checkInData: CheckInRequestDTO): Promise<CheckInResponseDTO> {
    // Use the unified check-in endpoint that handles both guest and existing customers
    // Backend expects: name, contact, phoneNumber, email, note, isGuest, requestedService
    // Backend's CheckInRequestDTO uses `boolean isGuest` with Lombok @Data,
    // which generates setGuest(...) — Jackson deserializes the JSON property
    // `guest`, NOT `isGuest`. Sending `isGuest:true` would leave the flag
    // false on the server, causing the request to fall into the
    // find-existing-customer branch and 400.
    //
    // Critically: send empty strings as `null` (omitted), because the
    // Customer.email column has a unique constraint. Two guests with
    // email="" would collide on the unique index and produce a 500.
    const blankToUndef = (v?: string | null) => {
      if (v == null) return undefined;
      const t = String(v).trim();
      return t.length === 0 ? undefined : t;
    };
    const phone = blankToUndef(checkInData.phoneNumber);
    const email = blankToUndef(checkInData.email);
    const contact = phone || email;
    if (!contact) {
      throw new Error('Phone or email is required for check-in');
    }
    const requestBody: Record<string, any> = {
      name: checkInData.name,
      contact,
      guest: checkInData.guest ?? true,
    };
    if (phone) requestBody.phoneNumber = phone;
    if (email) requestBody.email = email;
    const note = blankToUndef(checkInData.notes);
    if (note) requestBody.note = note;
    const service = blankToUndef(checkInData.requestedService);
    if (service) requestBody.requestedService = service;
    // Forward numeric IDs for the scheduler. These are NEW since the
    // service-aware wait-time follow-up; backend uses them to pick the
    // real per-service duration and route the customer to a specific tech.
    if (checkInData.serviceTypeId != null && Number.isFinite(checkInData.serviceTypeId)) {
      requestBody.serviceTypeId = checkInData.serviceTypeId;
    }
    if (checkInData.preferredTechnicianId != null && Number.isFinite(checkInData.preferredTechnicianId)) {
      requestBody.preferredTechnicianId = checkInData.preferredTechnicianId;
    }
    
    return this.publicRequest<CheckInResponseDTO>('/checkin', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  async checkInExisting(phoneOrEmail: string): Promise<Customer> {
    // Public endpoint for existing customer check-in
    return this.publicRequest<Customer>(`/checkin/existing?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}`, {
      method: 'POST',
    });
  }

  async checkInGuest(name: string, phoneNumber: string): Promise<Customer> {
    // Public endpoint for guest check-in
    return this.publicRequest<Customer>(`/checkin/guest?name=${encodeURIComponent(name)}&phoneNumber=${encodeURIComponent(phoneNumber)}`, {
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