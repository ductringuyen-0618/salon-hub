import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import BookingForm from '@/components/BookingForm';
import Navigation from '@/components/Navigation';
import {
  Calendar,
  Clock,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { services, employees, generateTimeSlots } from '@/lib/bookingData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const BookingPage = () => {
  const [activeTab, setActiveTab] = useState('appointment');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState(
    selectedDate ? generateTimeSlots(format(selectedDate, 'yyyy-MM-dd')) : []
  );

  const handleBookingComplete = (booking: any) => {
    setBookingComplete(true);
    console.log('Booking completed:', booking);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    if (date) {
      const slots = generateTimeSlots(format(date, 'yyyy-MM-dd'));
      setAvailableSlots(slots);
    }
  };

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

  const popularServices = services.filter(service => service.popular);
  const availableEmployees = employees.filter(emp => emp.available);

  return (
    <div className="min-h-screen bg-dynamic-background">
      {/* Header */}
      <Navigation
        showBackButton={true}
        title="Book Your Appointment"
        subtitle="Schedule your visit or join our walk-in list"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-dynamic-text mb-4">
              Book Your Perfect Experience
            </h2>
            <p className="text-dynamic-text-secondary font-light max-w-2xl mx-auto text-lg">
              Choose your services and preferred time for the ultimate spa experience
            </p>
          </div>

          {/* Main Booking Interface - Full Width Calendar Focus */}
          <div className="space-y-8">
            {/* Services Selection - Top Section */}
            <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-3 text-dynamic-text text-2xl">
                  <Sparkles className="h-8 w-8 text-dynamic-primary" />
                  Select Your Services
                </CardTitle>
                <CardDescription className="text-dynamic-text-secondary text-lg">
                  Choose from our premium nail care and spa treatments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={cn(
                        "border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg",
                        selectedServices.includes(service.id)
                          ? "border-dynamic-primary bg-dynamic-primary/10 shadow-md scale-105"
                          : "border-dynamic-border hover:border-dynamic-primary/50"
                      )}
                      onClick={() => handleServiceToggle(service.id)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <Checkbox
                            checked={selectedServices.includes(service.id)}
                            className="mt-1"
                          />
                          {service.popular && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-dynamic-text text-lg mb-2">{service.name}</h4>
                          <p className="text-sm text-dynamic-text-secondary mb-4 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-dynamic-text-secondary">
                              <Clock className="h-4 w-4" />
                              {service.duration} min
                            </span>
                            <span className="flex items-center gap-1 text-dynamic-primary font-semibold text-lg">
                              <DollarSign className="h-4 w-4" />
                              ${service.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Services Summary */}
                {selectedServices.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl border border-pink-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Services Selected</p>
                        <p className="text-2xl font-semibold text-gray-800">{selectedServices.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Duration</p>
                        <p className="text-2xl font-semibold text-gray-800">{getTotalDuration()} min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Price</p>
                        <p className="text-3xl font-bold text-dynamic-primary">${getTotalPrice()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar Section - Large and Prominent */}
            {selectedServices.length > 0 && (
              <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="flex items-center justify-center gap-3 text-dynamic-text text-2xl">
                    <Calendar className="h-8 w-8 text-dynamic-primary" />
                    Choose Your Date & Time
                  </CardTitle>
                  <CardDescription className="text-dynamic-text-secondary text-lg">
                    Select your preferred appointment date and available time slot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Calendar */}
                    <div className="flex justify-center">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
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
                          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: cn(
                            "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-dynamic-primary/20 rounded-lg transition-all duration-200"
                          ),
                          day_selected: "bg-dynamic-primary text-white hover:bg-dynamic-primary hover:text-white focus:bg-dynamic-primary focus:text-white shadow-md",
                          day_today: "bg-dynamic-accent/20 text-dynamic-accent font-semibold",
                          day_outside: "text-muted-foreground opacity-30",
                          day_disabled: "text-muted-foreground opacity-30",
                          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          day_hidden: "invisible",
                        }}
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      {selectedDate ? (
                        <div>
                          <h5 className="font-semibold text-dynamic-text mb-4 text-lg">
                            Available Times for {format(selectedDate, 'EEEE, MMMM d')}
                          </h5>
                          <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                            {availableSlots.filter(slot => slot.available).map((slot) => (
                              <Button
                                key={slot.time}
                                variant={selectedTime === slot.time ? "default" : "outline"}
                                size="lg"
                                onClick={() => setSelectedTime(slot.time)}
                                className={cn(
                                  "text-sm font-medium transition-all duration-200 h-12",
                                  selectedTime === slot.time 
                                    ? "bg-dynamic-primary text-white shadow-md scale-105" 
                                    : "border-dynamic-border hover:border-dynamic-primary hover:bg-dynamic-primary/10"
                                )}
                              >
                                {slot.time}
                              </Button>
                            ))}
                          </div>
                          {availableSlots.filter(slot => slot.available).length === 0 && (
                            <div className="text-center py-12 text-dynamic-text-secondary">
                              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p className="text-lg">No available time slots for this date</p>
                              <p className="text-sm">Please select a different date</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-dynamic-text-secondary">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Please select a date</p>
                          <p className="text-sm">Choose a date from the calendar to see available times</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Confirmation */}
                  {selectedServices.length > 0 && selectedDate && selectedTime && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <h5 className="font-semibold text-gray-800 mb-3 text-xl">Ready to Book!</h5>
                        <div className="space-y-2 mb-6">
                          <p className="text-gray-700">
                            <strong>Services:</strong> {getSelectedServicesDetails().map(s => s.name).join(', ')}
                          </p>
                          <p className="text-gray-700">
                            <strong>Date & Time:</strong> {format(selectedDate, 'EEEE, MMMM d')} at {selectedTime}
                          </p>
                          <p className="text-gray-700">
                            <strong>Duration:</strong> {getTotalDuration()} minutes • <strong>Total:</strong> ${getTotalPrice()}
                          </p>
                        </div>
                        <Button 
                          size="lg"
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 text-lg"
                          onClick={() => setActiveTab('details')}
                        >
                          Continue to Complete Booking
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Process Tabs */}
          <div className="mt-16">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-dynamic-surface border border-dynamic-border rounded-2xl p-1 shadow-lg">
                  <TabsTrigger
                    value="appointment"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-light data-[state=active]:bg-dynamic-primary data-[state=active]:text-white transition-all duration-300"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Quick Select</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-light data-[state=active]:bg-dynamic-primary data-[state=active]:text-white transition-all duration-300"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Complete</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="walkin"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-light data-[state=active]:bg-dynamic-primary data-[state=active]:text-white transition-all duration-300"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Walk-in</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="appointment">
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-6 text-dynamic-primary opacity-50" />
                  <h3 className="text-2xl font-light text-dynamic-text mb-4">Select Your Services Above</h3>
                  <p className="text-dynamic-text-secondary mb-4 max-w-lg mx-auto">
                    Choose your desired services from our premium selection, then pick your preferred date and time.
                  </p>
                  <p className="text-sm text-dynamic-text-secondary">
                    Once you've made your selections, click "Continue to Complete Booking" to finalize your appointment.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="max-w-2xl mx-auto">
                  <BookingForm
                    onBookingComplete={handleBookingComplete}
                    isWalkIn={false}
                  />
                </div>
              </TabsContent>

              <TabsContent value="walkin">
                <div className="space-y-8 max-w-4xl mx-auto">
                  <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
                    <CardHeader className="text-center pb-6">
                      <CardTitle className="flex items-center justify-center gap-3 text-dynamic-text text-2xl font-light">
                        <div className="w-12 h-12 bg-dynamic-accent/10 rounded-full flex items-center justify-center">
                          <Clock className="h-6 w-6 text-dynamic-accent" />
                        </div>
                        Join Our Wellness Queue
                      </CardTitle>
                      <CardDescription className="text-dynamic-text-secondary font-light text-lg max-w-2xl mx-auto">
                        Experience spontaneous luxury with our walk-in service. Perfect for when you're ready to indulge
                        in immediate wellness and beauty care.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="flex items-center gap-4 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-dynamic-text">Current Wait</p>
                            <p className="text-sm text-dynamic-text-secondary font-light">Approximately 25 minutes</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-green-50 rounded-2xl border border-green-100">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-dynamic-text">Same Day Luxury</p>
                            <p className="text-sm text-dynamic-text-secondary font-light">No advance planning required</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-dynamic-text">Live Updates</p>
                            <p className="text-sm text-dynamic-text-secondary font-light">SMS notifications when ready</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <BookingForm
                    onBookingComplete={handleBookingComplete}
                    isWalkIn={true}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Additional Information Section */}
          <div className="mt-16 space-y-12">
            {/* Salon Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Popular Services */}
              <Card className="bg-dynamic-surface border-dynamic-border shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-dynamic-text">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="font-light text-xl">Signature Treatments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {popularServices.map((service) => (
                      <div key={service.id} className="flex justify-between items-center p-3 bg-dynamic-background rounded-lg border border-dynamic-border/50">
                        <div>
                          <p className="font-medium text-dynamic-text">{service.name}</p>
                          <p className="text-sm text-dynamic-text-secondary font-light">
                            {service.duration} minutes • ${service.price}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Most Loved</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expert Artisans */}
              <Card className="bg-dynamic-surface border-dynamic-border shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-dynamic-text">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-light text-xl">Expert Artisans</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableEmployees.map((employee) => (
                      <div key={employee.id} className="flex justify-between items-center p-3 bg-dynamic-background rounded-lg border border-dynamic-border/50">
                        <div>
                          <p className="font-medium text-dynamic-text">{employee.name}</p>
                          <p className="text-sm text-dynamic-text-secondary font-light">
                            {employee.specialties.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">Available</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Live Status */}
              <Card className="bg-dynamic-surface border-dynamic-border shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-dynamic-text">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-light text-xl">Live Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-dynamic-background rounded-lg border border-dynamic-border/50">
                      <span className="text-dynamic-text-secondary font-light">Hours Today</span>
                      <span className="text-dynamic-text font-medium">9:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dynamic-background rounded-lg border border-dynamic-border/50">
                      <span className="text-dynamic-text-secondary font-light">Current Wait</span>
                      <span className="text-dynamic-text font-medium">~25 minutes</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dynamic-background rounded-lg border border-dynamic-border/50">
                      <span className="text-dynamic-text-secondary font-light">Walk-ins</span>
                      <span className="text-green-600 font-medium">Always Welcome</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dynamic-background rounded-lg border border-dynamic-border/50">
                      <span className="text-dynamic-text-secondary font-light">Online Booking</span>
                      <span className="text-blue-600 font-medium">Available Now</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Luxury Footer */}
      <footer className="bg-dynamic-surface border-t border-dynamic-border/50 mt-20">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-light text-dynamic-text mb-4">Ready to Begin Your Wellness Journey?</h3>
            <p className="text-dynamic-text-secondary font-light mb-6">
              Our expert team is here to provide you with an exceptional spa experience tailored to your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center gap-2 text-dynamic-text-secondary">
                <Clock className="h-4 w-4 text-dynamic-primary" />
                <span className="font-light">Open Daily 9:00 AM - 7:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-dynamic-text-secondary">
                <Users className="h-4 w-4 text-dynamic-primary" />
                <span className="font-light">Walk-ins Always Welcome</span>
              </div>
            </div>
            <div className="border-t border-dynamic-border/30 pt-6">
              <p className="text-dynamic-text-secondary font-light">
                © {new Date().getFullYear()} Five Nails & Spa. All rights reserved.
              </p>
              <p className="text-sm text-dynamic-text-secondary font-light mt-2">
                Questions? Call us at (555) 123-4567 or visit us in person for immediate assistance.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;
