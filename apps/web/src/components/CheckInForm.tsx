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
  // Empty string = "First Available" (no specific tech preference).
  // Non-empty = string-stringified Employee.id.
  technician: z.string(),
  // Empty string = no specific service (scheduler uses 30-min default).
  // Non-empty = string-stringified ServiceType.id.
  service: z.string(),
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
      service: "",
    },
  });

  // Live employee + service catalog so the form sends real IDs.
  const [employees, setEmployees] = useState<Array<{ id: number; name: string; role: string; available: boolean }>>([]);
  const [services, setServices] = useState<Array<{ id: number; name: string; estimatedDurationMinutes?: number; duration?: number; price?: number | string; category?: string }>>([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [emps, svcs] = await Promise.all([
          apiService.getEmployees(),
          apiService.getServices(),
        ]);
        if (cancelled) return;
        setEmployees((emps || []).filter((e: any) => e.available && e.role !== 'FRONT_DESK'));
        setServices(svcs || []);
      } catch (err) {
        console.warn('[check-in] failed to load employees/services; using defaults', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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
    const checkInResults: { name: string; queuePosition?: number }[] = [];

    // /api/checkin is documented as PUBLIC (see SECURITY-PERMISSIONS.md).
    // Guest check-in must NOT require any login.
    //
    // Walk-ins with multiple people (party size > 1) used to be silently
    // dropped — api.ts forwarded only the primary guest, so the
    // `additionalPeople` UI was cosmetic. We now POST one /api/checkin per
    // person so each gets their own queue entry, with partial-failure
    // handling: if person 2 fails we still keep person 1's queue entry.
    const isEmail = values.contact.includes('@');
    // "__any__" is the sentinel for "No preference / First Available". The
    // real backend IDs are positive numbers; we translate the sentinel to
    // null so the scheduler defaults kick in.
    const techIdRaw = values.technician;
    const serviceIdRaw = values.service;
    const techIdNum = (techIdRaw && techIdRaw !== '__any__') ? Number(techIdRaw) : null;
    const serviceIdNum = (serviceIdRaw && serviceIdRaw !== '__any__') ? Number(serviceIdRaw) : null;
    const primary = {
      name: values.name,
      phoneNumber: isEmail ? undefined : values.contact,
      email: isEmail ? values.contact : undefined,
      preferredTechnicianId: Number.isFinite(techIdNum as number) && (techIdNum as number) > 0 ? techIdNum : null,
      serviceTypeId: Number.isFinite(serviceIdNum as number) && (serviceIdNum as number) > 0 ? serviceIdNum : null,
      notes: '',
      requestedService: '',
      guest: true,
    };

    // Build the people-to-check-in queue. Additional people share the contact
    // with the primary so staff can reach the whole party with one phone number.
    const peopleToCheckIn: Array<{ name: string; phoneNumber?: string; email?: string }> = [
      primary,
      ...additionalPeople.map(p => ({
        name: p.name,
        phoneNumber: primary.phoneNumber,
        email: primary.email,
        guest: true,
      })),
    ];

    let firstResponse: any = null;
    const failures: Array<{ name: string; reason: string }> = [];

    try {
      for (let i = 0; i < peopleToCheckIn.length; i++) {
        const person = peopleToCheckIn[i];
        try {
          const resp = await apiService.checkIn({
            name: person.name,
            phoneNumber: person.phoneNumber,
            email: person.email,
            preferredTechnicianId: primary.preferredTechnicianId ?? undefined,
            serviceTypeId: primary.serviceTypeId ?? undefined,
            notes: '',
            requestedService: '',
            guest: true,
          } as any);
          if (i === 0) firstResponse = resp;
          checkInResults.push({ name: person.name, queuePosition: resp.queuePosition });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Check-in failed';
          failures.push({ name: person.name, reason: msg });
          console.error(`[checkin] failed for ${person.name}:`, err);
        }
      }

      if (checkInResults.length === 0) {
        // Everyone failed. Surface the first error.
        const reason = failures[0]?.reason || 'Check-in failed. Please try again.';
        setError(reason);
        showError('Check-in Failed', reason);
        return;
      }

      // At least one succeeded → show success view. Display details about
      // any partial failures so the user can re-try just those names.
      const waitTime = firstResponse?.estimatedWaitTime ?? 25;
      const firstPos = firstResponse?.queuePosition ?? 1;
      setEstimatedWaitTime(waitTime);
      setTotalQueueLength(firstPos);
      setSuccessfulCheckIns(checkInResults);
      setIsSuccess(true);
      form.reset();
      setAdditionalPeople([]);

      const totalPeople = checkInResults.length;
      const successMsg = totalPeople === 1
        ? `${checkInResults[0].name} has been checked in successfully. Queue position: ${firstPos}. Estimated wait: ${waitTime} minutes.`
        : `${totalPeople} people checked in successfully. First position: ${firstPos}. Estimated wait: ${waitTime} minutes.`;
      success(successMsg);

      if (failures.length > 0) {
        showError(
          'Some people could not be checked in',
          failures.map(f => `${f.name}: ${f.reason}`).join('; ')
        );
      }
    } catch (error) {
      // Unexpected outer-loop error (programmer bug, not an API failure).
      console.error('Check-in onSubmit failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Check-in failed. Please try again.';
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
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Service (optional)
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="What are you here for?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Radix forbids value="" on SelectItem. Sentinel
                            "__any__" maps back to null at submit. */}
                        <SelectItem value="__any__">No preference</SelectItem>
                        {services.map(s => {
                          const mins = s.estimatedDurationMinutes ?? s.duration ?? 30;
                          return (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name} {mins ? `(${mins} min)` : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Picking a service gives you a more accurate wait estimate. Leave as "No preference" if you're not sure.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your technician preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* "__any__" sentinel — see service dropdown above. */}
                        <SelectItem value="__any__">First Available</SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={String(emp.id)}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      "First Available" gives you the soonest slot. Picking a specific technician may mean a longer wait but guarantees who'll serve you.
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
