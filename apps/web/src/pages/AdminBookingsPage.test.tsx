import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

vi.mock('@/services/api', () => ({
  apiService: {
    getAppointments: vi.fn(),
    getCustomers: vi.fn(),
    getEmployees: vi.fn(),
    updateAppointmentStatus: vi.fn(),
    deleteAppointment: vi.fn(),
  },
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@/contexts/SettingsContext', () => ({
  useSettings: () => ({ settings: { businessName: 'SalonHub' } }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { name: 'Staff User', email: 'staff@example.com', phoneNumber: '555-0100', role: 'ADMIN' },
    logout: vi.fn(),
    loading: false,
    initializing: false,
    error: null,
  }),
}));

import AdminBookingsPage from '@/pages/AdminBookingsPage';
import { apiService } from '@/services/api';

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminBookingsPage />
    </MemoryRouter>
  );

const appointment = {
  id: 1,
  customerId: 10,
  employeeId: 20,
  services: [{ id: 1, name: 'Manicure', estimatedDurationMinutes: 30, price: 35 }],
  startTime: '2026-01-01T10:00:00',
  status: 'PENDING' as const,
};

describe('AdminBookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getCustomers).mockResolvedValue([{ id: 10, name: 'Jane Doe' }]);
    vi.mocked(apiService.getEmployees).mockResolvedValue([{ id: 20, name: 'Alice', available: true, role: 'TECHNICIAN' }]);
  });

  it('shows a loading state while fetching', () => {
    vi.mocked(apiService.getAppointments).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/loading bookings/i)).toBeInTheDocument();
  });

  it('shows an empty state distinct from the error state when there are no appointments', async () => {
    vi.mocked(apiService.getAppointments).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText(/no appointments for this day/i)).toBeInTheDocument());
    expect(screen.queryByText(/could not load bookings/i)).not.toBeInTheDocument();
  });

  it('shows an error state when the fetch fails', async () => {
    vi.mocked(apiService.getAppointments).mockRejectedValue(new Error('network down'));
    renderPage();
    await waitFor(() => expect(screen.getByText(/could not load bookings/i)).toBeInTheDocument());
  });

  it('renders appointments with customer, employee and a status action', async () => {
    vi.mocked(apiService.getAppointments).mockResolvedValue([appointment]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('asks for confirmation before cancelling', async () => {
    vi.mocked(apiService.getAppointments).mockResolvedValue([appointment]);
    renderPage();
    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByText(/cancel this appointment/i)).toBeInTheDocument();
    expect(apiService.deleteAppointment).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /cancel appointment/i }));
    await waitFor(() => expect(apiService.deleteAppointment).toHaveBeenCalledWith(1));
  });
});
