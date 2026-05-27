import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock dependencies with inline objects for hoisting
vi.mock('@/services/api', () => ({
  apiService: {
    checkIn: vi.fn(),
    login: vi.fn(),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: {
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '555-0100',
      role: 'CUSTOMER',
    },
    login: vi.fn(),
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

// Import after mocks
import CheckInForm from '@/components/CheckInForm';
import { apiService } from '@/services/api';

describe('CheckInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService).checkIn.mockReset();
  });

  describe('Rendering', () => {
    it('should render check-in form with required fields', () => {
      render(<CheckInForm />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone.*email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /check.in/i })).toBeInTheDocument();
    });

    it('should auto-populate form when user is authenticated', async () => {
      render(<CheckInForm />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i);
        expect(nameInput).toHaveValue('Test User');
      });
    });

    it('should have a technician preference section', () => {
      render(<CheckInForm />);

      // There are multiple elements with "technician" text (label, placeholder, description)
      const technicianElements = screen.getAllByText(/technician/i);
      expect(technicianElements.length).toBeGreaterThan(0);
    });

    it('should show additional people section', () => {
      render(<CheckInForm />);

      expect(screen.getByText(/additional people/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/add.*name/i)).toBeInTheDocument();
    });
  });

  describe('Form Pre-populated State', () => {
    it('should have name field readonly when authenticated', async () => {
      render(<CheckInForm />);

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute('readonly');
    });

    it('should have contact field readonly when authenticated', async () => {
      render(<CheckInForm />);

      const contactInput = screen.getByLabelText(/phone.*email/i);
      expect(contactInput).toHaveAttribute('readonly');
    });

    it('should show user phone number as contact value', async () => {
      render(<CheckInForm />);

      const contactInput = screen.getByLabelText(/phone.*email/i);
      expect(contactInput).toHaveValue('555-0100');
    });
  });

  describe('Technician Selection', () => {
    it('should render technician combobox', async () => {
      render(<CheckInForm />);

      const technicianSelect = screen.getByRole('combobox');
      expect(technicianSelect).toBeInTheDocument();
    });

    it('should have hidden select with options', () => {
      render(<CheckInForm />);
      
      // Radix Select renders a hidden native select for accessibility
      const options = screen.getAllByRole('option', { hidden: true });
      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('Additional People Feature', () => {
    it('should render additional people input', () => {
      render(<CheckInForm />);

      const addPersonInput = screen.getByPlaceholderText(/add.*name/i);
      expect(addPersonInput).toBeInTheDocument();
    });

    it('should allow typing in additional person input', async () => {
      const user = userEvent.setup();
      render(<CheckInForm />);

      const addPersonInput = screen.getByPlaceholderText(/add.*name/i);
      await user.type(addPersonInput, 'Jane Doe');
      
      expect(addPersonInput).toHaveValue('Jane Doe');
    });
  });

  describe('Form Submission', () => {
    it('should have a submit button', () => {
      render(<CheckInForm />);

      const submitButton = screen.getByRole('button', { name: /check.in/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should call checkIn API on form submit', async () => {
      vi.mocked(apiService).checkIn.mockResolvedValue({
        id: 1,
        queuePosition: 3,
        estimatedWaitTime: 25,
        message: 'Check-in successful',
        success: true,
        name: 'Test User',
        phoneNumber: '555-0100',
        email: 'test@example.com',
        guest: false,
        checkedInAt: new Date().toISOString(),
        queueId: 123,
      });

      const user = userEvent.setup();
      render(<CheckInForm />);

      // Submit form directly
      const form = screen.getByRole('button', { name: /check.in/i }).closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }

      await waitFor(() => {
        expect(apiService.checkIn).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(apiService).checkIn.mockRejectedValue(new Error('Check-in failed'));

      render(<CheckInForm />);

      // Submit form directly
      const form = screen.getByRole('button', { name: /check.in/i }).closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }

      await waitFor(() => {
        expect(apiService.checkIn).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });
});
