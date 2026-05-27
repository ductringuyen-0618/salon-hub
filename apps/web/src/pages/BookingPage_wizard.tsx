import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import {
  Calendar,
  Clock,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { services, employees, generateTimeSlots } from '@/lib/bookingData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type BookingStep = 'services' | 'datetime' | 'details' | 'confirmation';

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('services');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [bookingComplete, setBookingComplete] = useState(false);

  const steps = [
    { id: 'services', title: 'Services', description: 'Choose your treatments' },
    { id: 'datetime', title: 'Date & Time', description: 'Pick your schedule' },
    { id: 'details', title: 'Your Details', description: 'Contact information' },
    { id: 'confirmation', title: 'Confirm', description: 'Review & book' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(format(selectedDate, 'yyyy-MM-dd'));
      setAvailableSlots(slots);
    }
  }, [selectedDate]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const getSelectedServicesDetails = () => {
    return services.filter(service => selectedServices.includes(service.id));
  };

  const getTotalPrice = () => {
    return getSelectedServicesDetails().reduce((total, service) => total + service.price, 0);
  };

  const getTotalDuration = () => {
    return getSelectedServicesDetails().reduce((total, service) => total + service.duration, 0);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'services':
        return selectedServices.length > 0;
      case 'datetime':
        return selectedDate && selectedTime;
      case 'details':
        return customerInfo.name && customerInfo.email && customerInfo.phone;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id as BookingStep);
    }
  };

  const handlePrevious = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id as BookingStep);
    }
  };

  const handleBookingSubmit = () => {
    setBookingComplete(true);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-dynamic-background">
        <Navigation
          showBackButton={true}
          title="Booking Confirmed"
          subtitle="Your appointment has been scheduled"
        />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
              <h1 className="text-4xl font-light text-dynamic-text mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-dynamic-text-secondary text-lg">
                Your appointment has been successfully scheduled. We'll send you a confirmation email shortly.
              </p>
            </div>
            
            <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between">
                    <span className="text-dynamic-text-secondary">Services:</span>
                    <span className="text-dynamic-text font-medium">
                      {getSelectedServicesDetails().map(s => s.name).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dynamic-text-secondary">Date & Time:</span>
                    <span className="text-dynamic-text font-medium">
                      {selectedDate && format(selectedDate, 'EEEE, MMMM d')} at {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dynamic-text-secondary">Duration:</span>
                    <span className="text-dynamic-text font-medium">{getTotalDuration()} minutes</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-dynamic-text">Total:</span>
                    <span className="text-dynamic-primary">${getTotalPrice()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => window.location.href = '/'}
              className="mt-8 bg-dynamic-primary text-white px-8 py-3"
            >
              Return to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation
        showBackButton={true}
        title="Book Your Appointment"
        subtitle="Follow the steps to schedule your perfect spa experience"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    index <= currentStepIndex 
                      ? "bg-dynamic-primary text-white" 
                      : "bg-gray-200 text-gray-500"
                  )}>
                    {index + 1}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={cn(
                      "text-sm font-medium",
                      index <= currentStepIndex ? "text-dynamic-text" : "text-gray-500"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-dynamic-text-secondary">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "hidden sm:block w-24 h-0.5 mx-4 transition-all duration-300",
                      index < currentStepIndex ? "bg-dynamic-primary" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
            <CardContent className="p-8">
              {/* Services Step */}
              {currentStep === 'services' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <Sparkles className="h-12 w-12 text-dynamic-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-light text-dynamic-text mb-2">Choose Your Services</h2>
                    <p className="text-dynamic-text-secondary">Select the treatments you'd like to enjoy</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={cn(
                          "border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg",
                          selectedServices.includes(service.id)
                            ? "border-dynamic-primary bg-dynamic-primary/5 shadow-md ring-2 ring-dynamic-primary/20"
                            : "border-dynamic-border hover:border-dynamic-primary/50"
                        )}
                        onClick={() => handleServiceToggle(service.id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                            selectedServices.includes(service.id)
                              ? "border-dynamic-primary bg-dynamic-primary"
                              : "border-gray-300"
                          )}>
                            {selectedServices.includes(service.id) && (
                              <CheckCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                          {service.popular && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              Popular
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-medium text-dynamic-text mb-2">{service.name}</h3>
                        <p className="text-dynamic-text-secondary mb-4 text-sm leading-relaxed">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-dynamic-text-secondary">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {service.duration} min
                            </span>
                          </div>
                          <div className="text-2xl font-semibold text-dynamic-primary">
                            ${service.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Total duration: {getTotalDuration()} minutes
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-dynamic-primary">${getTotalPrice()}</div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Date & Time Step */}
              {currentStep === 'datetime' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <Calendar className="h-12 w-12 text-dynamic-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-light text-dynamic-text mb-2">Pick Your Date & Time</h2>
                    <p className="text-dynamic-text-secondary">Choose when you'd like to visit us</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Calendar */}
                    <div>
                      <h3 className="text-xl font-medium text-dynamic-text mb-4">Select Date</h3>
                      <div className="flex justify-center">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                          className="rounded-2xl border-2 border-dynamic-border shadow-sm"
                          classNames={{
                            months: "flex flex-col space-y-4",
                            month: "space-y-4",
                            caption: "flex justify-center pt-2 relative items-center",
                            caption_label: "text-lg font-medium",
                            nav: "space-x-1 flex items-center",
                            nav_button: cn(
                              "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-dynamic-primary/10 rounded-md"
                            ),
                            nav_button_previous: "absolute left-2",
                            nav_button_next: "absolute right-2",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-muted-foreground rounded-md w-12 font-normal text-sm",
                            row: "flex w-full mt-2",
                            cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                            day: cn(
                              "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-dynamic-primary/20 rounded-lg transition-all duration-200"
                            ),
                            day_selected: "bg-dynamic-primary text-white hover:bg-dynamic-primary hover:text-white focus:bg-dynamic-primary focus:text-white shadow-md",
                            day_today: "bg-dynamic-accent/20 text-dynamic-accent font-semibold",
                            day_outside: "text-muted-foreground opacity-30",
                            day_disabled: "text-muted-foreground opacity-30",
                          }}
                        />
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <h3 className="text-xl font-medium text-dynamic-text mb-4">
                        {selectedDate ? `Available Times for ${format(selectedDate, 'EEEE, MMM d')}` : 'Select a date first'}
                      </h3>
                      
                      {selectedDate ? (
                        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                          {availableSlots.filter(slot => slot.available).map((slot) => (
                            <Button
                              key={slot.time}
                              variant={selectedTime === slot.time ? "default" : "outline"}
                              onClick={() => setSelectedTime(slot.time)}
                              className={cn(
                                "h-12 text-sm font-medium transition-all duration-200",
                                selectedTime === slot.time 
                                  ? "bg-dynamic-primary text-white shadow-md" 
                                  : "border-dynamic-border hover:border-dynamic-primary hover:bg-dynamic-primary/10"
                              )}
                            >
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-dynamic-text-secondary">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Please select a date to see available times</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Employee Selection */}
                  {selectedDate && selectedTime && (
                    <div className="mt-8">
                      <h3 className="text-xl font-medium text-dynamic-text mb-4">Choose Your Technician (Optional)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div
                          className={cn(
                            "border rounded-xl p-4 cursor-pointer transition-all duration-200",
                            selectedEmployee === '' ? "border-dynamic-primary bg-dynamic-primary/5" : "border-dynamic-border hover:border-dynamic-primary/50"
                          )}
                          onClick={() => setSelectedEmployee('')}
                        >
                          <div className="text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-dynamic-primary" />
                            <p className="font-medium text-dynamic-text">No Preference</p>
                            <p className="text-sm text-dynamic-text-secondary">Any available technician</p>
                          </div>
                        </div>
                        
                        {employees.filter(emp => emp.available).map((employee) => (
                          <div
                            key={employee.id}
                            className={cn(
                              "border rounded-xl p-4 cursor-pointer transition-all duration-200",
                              selectedEmployee === employee.id ? "border-dynamic-primary bg-dynamic-primary/5" : "border-dynamic-border hover:border-dynamic-primary/50"
                            )}
                            onClick={() => setSelectedEmployee(employee.id)}
                          >
                            <div className="text-center">
                              <User className="h-8 w-8 mx-auto mb-2 text-dynamic-primary" />
                              <p className="font-medium text-dynamic-text">{employee.name}</p>
                              <p className="text-xs text-dynamic-text-secondary">{employee.specialties.join(', ')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Details Step */}
              {currentStep === 'details' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <User className="h-12 w-12 text-dynamic-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-light text-dynamic-text mb-2">Your Information</h2>
                    <p className="text-dynamic-text-secondary">We need a few details to confirm your booking</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-dynamic-text">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-dynamic-text-secondary" />
                        <Input
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-dynamic-text">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-dynamic-text-secondary" />
                        <Input
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-dynamic-text">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-dynamic-text-secondary" />
                        <Input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-dynamic-text">Special Requests (Optional)</label>
                      <Textarea
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any special requests or preferences..."
                        className="min-h-24"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Step */}
              {currentStep === 'confirmation' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <CheckCircle className="h-12 w-12 text-dynamic-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-light text-dynamic-text mb-2">Review Your Booking</h2>
                    <p className="text-dynamic-text-secondary">Please confirm all details are correct</p>
                  </div>

                  <div className="space-y-6">
                    {/* Services Summary */}
                    <div className="p-6 bg-dynamic-background rounded-2xl border border-dynamic-border">
                      <h3 className="font-semibold text-dynamic-text mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Selected Services
                      </h3>
                      <div className="space-y-3">
                        {getSelectedServicesDetails().map((service) => (
                          <div key={service.id} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-dynamic-text">{service.name}</p>
                              <p className="text-sm text-dynamic-text-secondary">{service.duration} minutes</p>
                            </div>
                            <span className="font-semibold text-dynamic-primary">${service.price}</span>
                          </div>
                        ))}
                        <div className="border-t border-dynamic-border pt-3 flex justify-between items-center">
                          <span className="font-semibold text-dynamic-text">Total</span>
                          <span className="text-2xl font-bold text-dynamic-primary">${getTotalPrice()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="p-6 bg-dynamic-background rounded-2xl border border-dynamic-border">
                      <h3 className="font-semibold text-dynamic-text mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Appointment Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-dynamic-text-secondary">Date:</span>
                          <span className="text-dynamic-text font-medium">
                            {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dynamic-text-secondary">Time:</span>
                          <span className="text-dynamic-text font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dynamic-text-secondary">Duration:</span>
                          <span className="text-dynamic-text font-medium">{getTotalDuration()} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dynamic-text-secondary">Technician:</span>
                          <span className="text-dynamic-text font-medium">
                            {selectedEmployee ? employees.find(emp => emp.id === selectedEmployee)?.name : 'Any available'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="p-6 bg-dynamic-background rounded-2xl border border-dynamic-border">
                      <h3 className="font-semibold text-dynamic-text mb-4 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Your Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-dynamic-text-secondary">Name:</span>
                          <span className="text-dynamic-text font-medium">{customerInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dynamic-text-secondary">Email:</span>
                          <span className="text-dynamic-text font-medium">{customerInfo.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dynamic-text-secondary">Phone:</span>
                          <span className="text-dynamic-text font-medium">{customerInfo.phone}</span>
                        </div>
                        {customerInfo.notes && (
                          <div>
                            <span className="text-dynamic-text-secondary block mb-1">Notes:</span>
                            <span className="text-dynamic-text">{customerInfo.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Navigation Buttons */}
            <div className="px-8 pb-8">
              <div className="flex justify-between items-center pt-6 border-t border-dynamic-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="text-center">
                  <p className="text-sm text-dynamic-text-secondary">
                    Step {currentStepIndex + 1} of {steps.length}
                  </p>
                </div>

                {currentStep === 'confirmation' ? (
                  <Button
                    onClick={handleBookingSubmit}
                    className="bg-dynamic-primary text-white px-8 py-3 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm Booking
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToNext()}
                    className="bg-dynamic-primary text-white px-8 py-3 flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
