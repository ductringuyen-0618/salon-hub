import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Check, Loader2, AlertCircle, Plus, Minus, Users2, UserCheck } from "lucide-react";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  contact: z.string().min(5, {
    message: "Please enter a valid phone number or email.",
  }),
  technician: z.string({
    required_error: "Please select a technician preference.",
  }),
});

const additionalPersonSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;
type AdditionalPerson = z.infer<typeof additionalPersonSchema>;

const CheckInForm = () => {
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(
    null,
  );
  const [additionalPeople, setAdditionalPeople] = useState<AdditionalPerson[]>([]);
  const [newPersonName, setNewPersonName] = useState("");
  const [successfulCheckIns, setSuccessfulCheckIns] = useState<{name: string, queuePosition?: number}[]>([]);
  const [totalQueueLength, setTotalQueueLength] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact: "",
      technician: "",
    },
  });

  // Auto-populate form when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      form.setValue('name', user.name || '');
      form.setValue('contact', user.phoneNumber || user.email || '');
    }
  }, [isAuthenticated, user, form]);

  const addAdditionalPerson = () => {
    if (newPersonName.trim().length >= 2) {
      setAdditionalPeople([...additionalPeople, { name: newPersonName.trim() }]);
      setNewPersonName("");
    }
  };

  const removeAdditionalPerson = (index: number) => {
    setAdditionalPeople(additionalPeople.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAdditionalPerson();
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    const checkInResults: {name: string, queuePosition?: number}[] = [];

    try {
      // Ensure user is authenticated (auto-login for demo)
      if (!isAuthenticated) {
        console.log('User not authenticated, attempting auto-login...');
        try {
          const loginResponse = await apiService.login({
            email: 'admin@salonhub.com',
            password: 'admin123'
          });
          console.log('Auto-login successful:', loginResponse);
          // The AuthContext will handle the token storage
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          throw new Error('Authentication required for check-in');
        }
        // Wait a moment for auth context to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Prepare check-in data
      const checkInData = {
        name: values.name,
        phoneNumber: values.contact.includes('@') ? null : values.contact,
        email: values.contact.includes('@') ? values.contact : null,
        preferredTechnician: values.technician,
        partySize: 1 + additionalPeople.length,
        additionalPeople: additionalPeople.map(person => ({ name: person.name })),
        notes: '', // Add notes field
        requestedService: '' // Add requested service field
      };

      console.log('Submitting check-in data:', checkInData);

      // Use the main check-in endpoint
      const response = await apiService.checkIn(checkInData);
      
      console.log('Check-in response:', response);
      
      // Handle successful check-in
      setEstimatedWaitTime(response.estimatedWaitTime || 25);
      setTotalQueueLength(response.queuePosition || 1);
      
      checkInResults.push({
        name: values.name,
        queuePosition: response.queuePosition
      });
      
      // Add additional people to results
      additionalPeople.forEach((person, index) => {
        checkInResults.push({
          name: person.name,
          queuePosition: (response.queuePosition || 1) + index + 1
        });
      });
      
      setSuccessfulCheckIns(checkInResults);
      setIsSuccess(true);
      form.reset();
      setAdditionalPeople([]);
      
      // Show success toast
      const totalPeople = checkInResults.length;
      const waitTime = response.estimatedWaitTime || 25;
      const message = totalPeople === 1 
        ? `${checkInResults[0].name} has been checked in successfully. Queue position: ${response.queuePosition}. Estimated wait: ${waitTime} minutes.`
        : `${totalPeople} people have been checked in successfully. Queue position: ${response.queuePosition}. Estimated wait: ${waitTime} minutes.`;
      
      success(message);
      
    } catch (error) {
      console.error("Check-in error:", error);
      
      // Handle specific error types
      let errorMessage = 'Check-in failed. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Authentication failed')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid information provided. Please check your details and try again.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message || 'Check-in failed. Please try again.';
        }
      }
      
      setError(errorMessage);
      showError('Check-in Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setEstimatedWaitTime(null);
    setError(null);
    setSuccessfulCheckIns([]);
    setAdditionalPeople([]);
    setNewPersonName("");
    setTotalQueueLength(null);
    form.reset();
  };

  return (
    <div className="w-full">
      {error && (
        <Alert className="mb-6 bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive">Error</AlertTitle>
          <AlertDescription className="text-destructive/80">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {isSuccess ? (
        <div className="space-y-6">
          <Alert className="bg-dynamic-primary/10 border-dynamic-primary/20">
            <Check className="h-5 w-5 text-dynamic-primary" />
            <AlertTitle className="text-dynamic-text">
              Check-in Successful!
            </AlertTitle>
            <AlertDescription className="text-dynamic-text-secondary">
              {successfulCheckIns.length === 1 ? (
                <>
                  <strong>{successfulCheckIns[0].name}</strong> has been checked in successfully.
                  {successfulCheckIns[0].queuePosition && (
                    <div className="text-xs mt-1">Check-in ID: #{successfulCheckIns[0].queuePosition}</div>
                  )}
                </>
              ) : (
                <>
                  <strong>{successfulCheckIns.length} people</strong> have been checked in successfully:
                  <div className="mt-2 flex flex-wrap gap-1">
                    {successfulCheckIns.map((person, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {person.name}
                        {person.queuePosition && ` (#${person.queuePosition})`}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-3 p-3 bg-dynamic-surface rounded-lg border border-dynamic-border">
                <div className="flex items-center gap-2 text-dynamic-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Estimated wait time: {estimatedWaitTime} minutes</span>
                </div>
                <p className="text-sm text-dynamic-text-secondary mt-1">
                  Please remain nearby and listen for your name to be called for service.
                </p>
              </div>
            </AlertDescription>
          </Alert>
          <Button 
            onClick={resetForm} 
            style={{backgroundColor: '#d34000'}}
            className="w-full text-white hover:bg-dynamic-primary-hover"
          >
            Check In Another Guest
          </Button>
        </div>
      ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        readOnly={isAuthenticated}
                        className={isAuthenticated ? "bg-dynamic-muted cursor-not-allowed" : ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {isAuthenticated 
                        ? "Your name from your account profile"
                        : "Please enter your full name as it will appear on the wait list."
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number or Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="555-123-4567 or example@email.com"
                        {...field}
                        readOnly={isAuthenticated}
                        className={isAuthenticated ? "bg-dynamic-muted cursor-not-allowed" : ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {isAuthenticated 
                        ? "Your contact information from your account profile"
                        : "We'll use this to notify you when it's your turn."
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="technician"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Technician Preference
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your technician preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="first-available">First Available</SelectItem>
                        <SelectItem value="lisa">Lisa - Nail Specialist</SelectItem>
                        <SelectItem value="maria">Maria - Pedicure Expert</SelectItem>
                        <SelectItem value="jenny">Jenny - Nail Art Specialist</SelectItem>
                        <SelectItem value="kim">Kim - Spa Services</SelectItem>
                        <SelectItem value="sarah">Sarah - Manicure Specialist</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select "First Available" for faster service, or choose a specific technician.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Additional People Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users2 className="h-4 w-4 text-dynamic-text-secondary" />
                  <h3 className="text-sm font-medium text-dynamic-text">Additional People</h3>
                </div>
                
                {/* Show current additional people */}
                {additionalPeople.length > 0 && (
                  <div className="space-y-2">
                    {additionalPeople.map((person, index) => (
                      <div key={index} className="flex items-center justify-between bg-dynamic-background p-3 rounded-lg border border-dynamic-border">
                        <span className="text-sm font-medium">{person.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAdditionalPerson(index)}
                          className="h-6 w-6 p-0 text-dynamic-primary hover:text-dynamic-primary-dark hover:bg-dynamic-primary/10"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new person */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add person's name"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAdditionalPerson}
                    disabled={newPersonName.trim().length < 2}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-dynamic-text-secondary">
                  Add family members or friends to check in together. They'll all use your contact information.
                </p>
              </div>

              <Button type="submit" className="w-full text-white hover:opacity-90 transition-all duration-200" style={{backgroundColor: '#d34000'}} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking In{additionalPeople.length > 0 ? ` ${additionalPeople.length + 1} People` : ''}...
                  </>
                ) : (
                  <>
                    Complete Check-In
                    {additionalPeople.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {additionalPeople.length + 1} people
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
        
        {!isAuthenticated && (
          <div className="text-center mt-6 pt-6 border-t border-dynamic-border">
            <p className="text-sm text-dynamic-text-secondary font-light">
              Already a member? Use the Member Login for faster check-in.
            </p>
          </div>
        )}
      </div>
    );
  };

export default CheckInForm;
