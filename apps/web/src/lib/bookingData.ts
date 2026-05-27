// Booking system data structures and mock data

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  category: 'manicure' | 'pedicure' | 'nails' | 'spa' | 'combo';
  description: string;
  popular?: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  employeeId?: string;
  employeeName?: string;
}

export interface Employee {
  id: string;
  name: string;
  specialties: string[];
  available: boolean;
  workingHours: {
    start: string;
    end: string;
  };
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceIds: string[];
  services: Service[];
  employeeId: string;
  employeeName: string;
  date: string;
  time: string;
  duration: number;
  totalPrice: number;
  status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  isWalkIn?: boolean;
}

// Available services
export const services: Service[] = [
  {
    id: 'manicure-basic',
    name: 'Basic Manicure',
    duration: 30,
    price: 25,
    category: 'manicure',
    description: 'Classic manicure with nail shaping, cuticle care, and polish',
    popular: true
  },
  {
    id: 'manicure-gel',
    name: 'Gel Manicure',
    duration: 45,
    price: 35,
    category: 'manicure',
    description: 'Long-lasting gel polish manicure with UV curing'
  },
  {
    id: 'manicure-deluxe',
    name: 'Deluxe Manicure',
    duration: 60,
    price: 45,
    category: 'manicure',
    description: 'Premium manicure with hand massage and moisturizing treatment'
  },
  {
    id: 'pedicure-basic',
    name: 'Basic Pedicure',
    duration: 45,
    price: 35,
    category: 'pedicure',
    description: 'Classic pedicure with foot soak, nail care, and polish',
    popular: true
  },
  {
    id: 'pedicure-spa',
    name: 'Spa Pedicure',
    duration: 60,
    price: 50,
    category: 'pedicure',
    description: 'Luxurious pedicure with exfoliation and foot massage'
  },
  {
    id: 'nails-full-set',
    name: 'Full Set Acrylic',
    duration: 90,
    price: 55,
    category: 'nails',
    description: 'Complete acrylic nail extension with shaping and polish'
  },
  {
    id: 'nails-fill',
    name: 'Acrylic Fill',
    duration: 60,
    price: 35,
    category: 'nails',
    description: 'Maintenance fill for existing acrylic nails'
  },
  {
    id: 'nails-removal',
    name: 'Nail Removal',
    duration: 30,
    price: 15,
    category: 'nails',
    description: 'Safe removal of acrylic or gel nails'
  },
  {
    id: 'combo-mani-pedi',
    name: 'Manicure & Pedicure',
    duration: 75,
    price: 55,
    category: 'combo',
    description: 'Complete nail care package for hands and feet',
    popular: true
  },
  {
    id: 'spa-massage',
    name: 'Hand & Foot Massage',
    duration: 30,
    price: 25,
    category: 'spa',
    description: 'Relaxing massage treatment for hands and feet'
  }
];

// Available employees
export const employees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Sarah Chen',
    specialties: ['manicure', 'nails', 'nail-art'],
    available: true,
    workingHours: { start: '09:00', end: '18:00' }
  },
  {
    id: 'emp-2',
    name: 'Maria Rodriguez',
    specialties: ['pedicure', 'spa', 'massage'],
    available: true,
    workingHours: { start: '10:00', end: '19:00' }
  },
  {
    id: 'emp-3',
    name: 'Jennifer Kim',
    specialties: ['manicure', 'pedicure', 'combo'],
    available: true,
    workingHours: { start: '08:00', end: '17:00' }
  },
  {
    id: 'emp-4',
    name: 'Lisa Thompson',
    specialties: ['nails', 'acrylic', 'gel'],
    available: false, // Off today
    workingHours: { start: '11:00', end: '20:00' }
  }
];

// Mock bookings for today
export const mockBookings: Booking[] = [
  {
    id: 'book-1',
    customerId: 'cust-1',
    customerName: 'Alice Johnson',
    customerEmail: 'alice@example.com',
    customerPhone: '555-1001',
    serviceIds: ['manicure-gel'],
    services: [services.find(s => s.id === 'manicure-gel')!],
    employeeId: 'emp-1',
    employeeName: 'Sarah Chen',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 45,
    totalPrice: 35,
    status: 'in-progress',
    createdAt: new Date().toISOString()
  },
  {
    id: 'book-2',
    customerId: 'cust-2',
    customerName: 'Bob Brown',
    customerEmail: 'bob@example.com',
    customerPhone: '555-1002',
    serviceIds: ['pedicure-spa'],
    services: [services.find(s => s.id === 'pedicure-spa')!],
    employeeId: 'emp-2',
    employeeName: 'Maria Rodriguez',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    duration: 60,
    totalPrice: 50,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  },
  {
    id: 'book-3',
    customerId: 'cust-3',
    customerName: 'Carol Davis',
    customerEmail: 'carol@example.com',
    customerPhone: '555-1003',
    serviceIds: ['combo-mani-pedi'],
    services: [services.find(s => s.id === 'combo-mani-pedi')!],
    employeeId: 'emp-3',
    employeeName: 'Jennifer Kim',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 75,
    totalPrice: 55,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }
];

// Generate time slots for a given date
export const generateTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 19;
  const slotDuration = 15; // 15-minute intervals

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check if slot is available (not booked)
      const isBooked = mockBookings.some(booking => 
        booking.date === date && 
        booking.time <= time && 
        addMinutesToTime(booking.time, booking.duration) > time
      );

      slots.push({
        time,
        available: !isBooked,
        employeeId: isBooked ? undefined : 'emp-1', // Simplified for mock
        employeeName: isBooked ? undefined : 'Available'
      });
    }
  }

  return slots;
};

// Utility function to add minutes to time string
export const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

// Calculate wait time based on current bookings and walk-ins
export const calculateWaitTime = (serviceIds: string[]): number => {
  const selectedServices = services.filter(s => serviceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
  
  // Base wait time calculation
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  // Find next available slot
  const today = new Date().toISOString().split('T')[0];
  const availableSlots = generateTimeSlots(today).filter(slot => 
    slot.available && slot.time > currentTimeString
  );
  
  if (availableSlots.length === 0) {
    return 120; // 2 hours if no slots available today
  }
  
  // Calculate time until next available slot
  const nextSlot = availableSlots[0];
  const [nextHour, nextMinute] = nextSlot.time.split(':').map(Number);
  const waitMinutes = (nextHour * 60 + nextMinute) - (currentHour * 60 + currentMinute);
  
  return Math.max(waitMinutes, 15); // Minimum 15 minutes wait
};
