import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CalendarIcon, 
  Clock, 
  DollarSign, 
  User, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  services, 
  employees, 
  generateTimeSlots, 
  calculateWaitTime,
  type Service,
  type TimeSlot 
} from '@/lib/bookingData';

const bookingFormSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email'),
  customerPhone: z.string().min(10, 'Please enter a valid phone number'),
  serviceIds: z.array(z.string()).min(1, 'Please select at least one service'),
  date: z.date({
    required_error: 'Please select a date',
  }),
  time: z.string().min(1, 'Please select a time'),
  employeeId: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onBookingComplete?: (booking: any) => void;
  isWalkIn?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  onBookingComplete, 
  isWalkIn = false 
}) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(0);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      serviceIds: [],
      notes: '',
    },
  });

  const watchedDate = form.watch('date');
  const watchedServiceIds = form.watch('serviceIds');

  // Update available time slots when date changes
  useEffect(() => {
    if (watchedDate) {
      const dateString = format(watchedDate, 'yyyy-MM-dd');
      const slots = generateTimeSlots(dateString);
      setAvailableSlots(slots);
    }
  }, [watchedDate]);

  // Update selected services and calculate wait time
  useEffect(() => {
    const selected = services.filter(service => 
      watchedServiceIds?.includes(service.id)
    );
    setSelectedServices(selected);
    
    if (watchedServiceIds?.length > 0) {
      const waitTime = calculateWaitTime(watchedServiceIds);
      setEstimatedWaitTime(waitTime);
    }
  }, [watchedServiceIds]);

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = form.getValues('serviceIds') || [];
    const updatedServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    
    form.setValue('serviceIds', updatedServices);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + service.duration, 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const onSubmit = async (data: BookingFormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const booking = {
        id: `book-${Date.now()}`,
        ...data,
        services: selectedServices,
        duration: getTotalDuration(),
        totalPrice: getTotalPrice(),
        status: isWalkIn ? 'in-progress' : 'confirmed',
        createdAt: new Date().toISOString(),
        isWalkIn,
      };

      setBookingSuccess(true);
      onBookingComplete?.(booking);
      
      // Reset form after success
      setTimeout(() => {
        setBookingSuccess(false);
        form.reset();
        setSelectedServices([]);
      }, 3000);
      
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">
              {isWalkIn ? 'Check-in Successful!' : 'Booking Confirmed!'}
            </h3>
            <p className="text-muted-foreground">
              {isWalkIn 
                ? `You've been added to the wait list. Estimated wait time: ${estimatedWaitTime} minutes.`
                : 'Your appointment has been scheduled. You will receive a confirmation email shortly.'
              }
            </p>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Services: {selectedServices.map(s => s.name).join(', ')}</p>
              <p>Total Duration: {getTotalDuration()} minutes</p>
              <p>Total Price: ${getTotalPrice()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isWalkIn ? 'Walk-in Check-in' : 'Book Appointment'}
        </CardTitle>
        <CardDescription>
          {isWalkIn 
            ? 'Select your services and join our wait list'
            : 'Schedule your nail salon appointment'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={cn(
                      "border rounded-lg p-4 cursor-pointer transition-colors",
                      watchedServiceIds?.includes(service.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={watchedServiceIds?.includes(service.id)}
                            onChange={() => handleServiceToggle(service.id)}
                          />
                          <h4 className="font-medium">{service.name}</h4>
                          {service.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${service.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <FormField
                control={form.control}
                name="serviceIds"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Selected Services Summary */}
            {selectedServices.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Selected Services:</strong> {selectedServices.map(s => s.name).join(', ')}
                  <br />
                  <strong>Total Duration:</strong> {getTotalDuration()} minutes
                  <br />
                  <strong>Total Price:</strong> ${getTotalPrice()}
                  {isWalkIn && (
                    <>
                      <br />
                      <strong>Estimated Wait Time:</strong> {estimatedWaitTime} minutes
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Date and Time Selection (only for appointments, not walk-ins) */}
            {!isWalkIn && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Date & Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {watchedDate && (
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Times</FormLabel>
                          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {availableSlots.filter(slot => slot.available).map((slot) => (
                              <Button
                                key={slot.time}
                                type="button"
                                variant={field.value === slot.time ? "default" : "outline"}
                                size="sm"
                                onClick={() => field.onChange(slot.time)}
                                className="text-xs"
                              >
                                {slot.time}
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests or preferences..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full text-white hover:opacity-90 transition-all duration-200"
              style={{backgroundColor: '#d34000'}}
              disabled={isLoading || selectedServices.length === 0}
            >
              {isLoading ? (
                "Processing..."
              ) : isWalkIn ? (
                "Join Wait List"
              ) : (
                "Book Appointment"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
