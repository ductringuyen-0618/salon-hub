import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { UserIcon, KeyIcon, CheckCircleIcon, XCircleIcon, Settings } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const MemberLoginForm = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      await login(data.email, data.password);
      // AuthContext will handle the user state and redirect will happen in LoginPage
    } catch (error: any) {
      setLoginError(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    setCheckInError(null);

    try {
      // Navigate to check-in page - user is already authenticated
      navigate('/check-in');
    } catch (error: any) {
      console.error("Check-in navigation failed:", error);
      setCheckInError(error.message || "Check-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {!isAuthenticated ? (
        <div className="space-y-6">
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <XCircleIcon className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-dynamic-text-secondary" />
                          <Input
                            placeholder="your.email@example.com"
                            className="pl-10 h-12 rounded-xl border-dynamic-border focus:border-dynamic-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyIcon className="absolute left-3 top-2.5 h-5 w-5 text-dynamic-text-secondary" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-12 rounded-xl border-dynamic-border focus:border-dynamic-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Remember me</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full text-white transition-all duration-200 border-0 rounded-xl h-12 font-medium hover:opacity-90" 
                  style={{backgroundColor: '#d34000'}}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              <a href="#" className="text-dynamic-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="mt-4 text-center text-sm pt-4 border-t border-dynamic-border">
              <span className="text-dynamic-text-secondary">Don't have an account? </span>
              <Link to="/register" className="text-dynamic-primary hover:text-dynamic-primary-hover transition-colors font-medium underline">
                Sign up
              </Link>
            </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center p-4 space-y-4">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-medium">
              Welcome back, {user?.name || 'User'}!
            </h3>
            <p>You are already logged in.</p>
            
            {checkInError && (
              <Alert variant="destructive" className="mb-4">
                <XCircleIcon className="h-4 w-4" />
                <AlertDescription>{checkInError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2 mt-4">
              <Button
                onClick={handleCheckIn}
                className="w-full text-white transition-all duration-200 border-0 rounded-xl h-12 font-medium hover:opacity-90"
                style={{backgroundColor: '#d34000'}}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Check In Now"}
              </Button>
              
              {user?.role === 'ADMIN' && (
                <Button
                  onClick={() => navigate('/admin')}
                  variant="secondary"
                  className="w-full bg-dynamic-primary/10 text-dynamic-text hover:bg-dynamic-primary/20 transition-all duration-200 border border-dynamic-primary/20 rounded-xl"
                  disabled={isLoading}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
        
      <div className="text-center mt-6 pt-6 border-t border-dynamic-border">
        <p className="text-xs text-dynamic-text-secondary font-light">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default MemberLoginForm;
