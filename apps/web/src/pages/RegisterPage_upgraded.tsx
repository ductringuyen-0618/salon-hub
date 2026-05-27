import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiService } from "@/services/api";
import { 
  Crown, 
  Star, 
  Gift, 
  Shield, 
  CheckCircle, 
  Users, 
  Calendar,
  Heart,
  Sparkles,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight
} from "lucide-react";

const formSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError("");
      
      const response = await apiService.register({
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phoneNumber: values.phone,
        password: values.password,
        role: 'CUSTOMER',
      });

      if (response.access_token) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dynamic-background">
        <Navigation
          showBackButton={true}
          title="Registration Successful"
          subtitle="Welcome to our member community"
        />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
              <CardContent className="p-12">
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-light text-dynamic-text mb-4">
                  Welcome to Five Nails & Spa!
                </h1>
                <p className="text-dynamic-text-secondary text-lg mb-8">
                  Your member account has been created successfully. You can now enjoy all our exclusive benefits and premium services.
                </p>
                <Button
                  onClick={() => navigate("/login")}
                  className="bg-dynamic-primary text-white px-8 py-3 rounded-full hover:bg-dynamic-primary-hover transition-colors flex items-center gap-2 mx-auto"
                >
                  <Crown className="h-5 w-5" />
                  Sign In to Your Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const memberBenefits = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Priority Booking",
      description: "Skip the wait with preferred appointment times"
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Exclusive Discounts",
      description: "Special member pricing and seasonal offers"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Personalized Care",
      description: "Customized treatments based on your preferences"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Loyalty Rewards",
      description: "Earn points and redeem for free services"
    }
  ];

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation
        showBackButton={true}
        title="Join Our Community"
        subtitle="Become a premium member today"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Benefits Section */}
            <div className="order-2 lg:order-1">
              <div className="text-center lg:text-left mb-8">
                <Badge className="bg-dynamic-primary/10 text-dynamic-primary border-dynamic-primary/20 mb-6">
                  ✨ JOIN OUR VIP COMMUNITY
                </Badge>
                
                <h1 className="text-3xl md:text-4xl font-light text-dynamic-text mb-4">
                  <span className="block">Unlock Exclusive</span>
                  <span className="text-dynamic-primary font-light italic">Member Benefits</span>
                </h1>
                
                <p className="text-lg text-dynamic-text-secondary leading-relaxed mb-8">
                  Join hundreds of satisfied members who enjoy premium nail care services, 
                  exclusive perks, and personalized wellness experiences.
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {memberBenefits.map((benefit, index) => (
                  <Card key={index} className="bg-dynamic-surface border-dynamic-border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-dynamic-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="text-dynamic-primary">
                            {benefit.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-dynamic-text mb-2">{benefit.title}</h3>
                          <p className="text-dynamic-text-secondary text-sm">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Statistics */}
              <Card className="bg-gradient-to-r from-dynamic-primary/5 to-dynamic-accent/5 border-dynamic-border">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-semibold text-dynamic-primary mb-1">500+</div>
                      <div className="text-xs text-dynamic-text-secondary">Happy Members</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-dynamic-primary mb-1">4.9</div>
                      <div className="text-xs text-dynamic-text-secondary">Average Rating</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-dynamic-primary mb-1">25%</div>
                      <div className="text-xs text-dynamic-text-secondary">Member Savings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registration Form */}
            <div className="order-1 lg:order-2">
              <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-dynamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-dynamic-primary" />
                  </div>
                  <CardTitle className="text-2xl font-light text-dynamic-text">
                    Create Your Account
                  </CardTitle>
                  <p className="text-dynamic-text-secondary">
                    Join our exclusive member community in just a few steps
                  </p>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-dynamic-text">First Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-dynamic-text-secondary" />
                                  <Input
                                    placeholder="Enter your first name"
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
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-dynamic-text">Last Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-dynamic-text-secondary" />
                                  <Input
                                    placeholder="Enter your last name"
                                    className="pl-10 h-12 rounded-xl border-dynamic-border focus:border-dynamic-primary"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dynamic-text">Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-dynamic-text-secondary" />
                                <Input
                                  type="email"
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
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dynamic-text">Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-dynamic-text-secondary" />
                                <Input
                                  type="tel"
                                  placeholder="(555) 123-4567"
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
                            <FormLabel className="text-dynamic-text">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-dynamic-text-secondary" />
                                <Input
                                  type="password"
                                  placeholder="Create a secure password"
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
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dynamic-text">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-dynamic-text-secondary" />
                                <Input
                                  type="password"
                                  placeholder="Confirm your password"
                                  className="pl-10 h-12 rounded-xl border-dynamic-border focus:border-dynamic-primary"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-dynamic-primary text-white hover:bg-dynamic-primary-hover transition-colors h-12 rounded-xl text-lg flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          "Creating Account..."
                        ) : (
                          <>
                            <Crown className="h-5 w-5" />
                            Become a Member
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>

                  {/* Login Link */}
                  <div className="mt-6 pt-6 border-t border-dynamic-border text-center">
                    <p className="text-dynamic-text-secondary mb-3">
                      Already have a member account?
                    </p>
                    <Link to="/login">
                      <Button
                        variant="outline"
                        className="border-dynamic-border hover:border-dynamic-primary hover:text-dynamic-primary transition-colors rounded-full px-6 py-2"
                      >
                        Sign In Instead
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-2 text-dynamic-text-secondary">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Your personal information is secure and protected</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
