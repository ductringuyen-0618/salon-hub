import React from "react";
import MemberLoginForm from "../components/MemberLoginForm";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Star, 
  Gift, 
  Shield, 
  CheckCircle, 
  Users, 
  Calendar,
  Heart,
  Sparkles
} from "lucide-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation
        showBackButton={true}
        title="Member Login"
        subtitle="Access your premium account"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Login Form Section */}
            <div className="order-2 lg:order-1">
              <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-dynamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-dynamic-primary" />
                  </div>
                  <CardTitle className="text-2xl font-light text-dynamic-text">
                    Welcome Back
                  </CardTitle>
                  <p className="text-dynamic-text-secondary">
                    Sign in to access your member benefits and preferences
                  </p>
                </CardHeader>
                <CardContent>
                  <MemberLoginForm />
                  
                  {/* Registration Link */}
                  <div className="mt-6 pt-6 border-t border-dynamic-border text-center">
                    <p className="text-dynamic-text-secondary mb-3">
                      Don't have a member account yet?
                    </p>
                    <Link to="/register">
                      <Button
                        variant="outline"
                        className="border-dynamic-primary text-dynamic-primary hover:bg-dynamic-primary hover:text-white transition-colors rounded-full px-6 py-2"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Become a Member
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Section */}
            <div className="order-1 lg:order-2">
              <div className="text-center lg:text-left mb-8">
                <Badge className="bg-dynamic-primary/10 text-dynamic-primary border-dynamic-primary/20 mb-6">
                  ✨ EXCLUSIVE MEMBER BENEFITS
                </Badge>
                
                <h1 className="text-3xl md:text-4xl font-light text-dynamic-text mb-4">
                  <span className="block">Unlock Your</span>
                  <span className="text-dynamic-primary font-light italic">Premium Experience</span>
                </h1>
                
                <p className="text-lg text-dynamic-text-secondary leading-relaxed mb-8">
                  Join our exclusive membership program and enjoy personalized service, 
                  priority booking, and special rewards designed just for you.
                </p>
              </div>

              {/* Benefits Cards */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Priority Booking</h3>
                        <p className="text-gray-600 text-sm">
                          Skip the wait with priority scheduling and preferred appointment times
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Gift className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Exclusive Discounts</h3>
                        <p className="text-gray-600 text-sm">
                          Enjoy special member pricing and seasonal discount offers
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Personalized Service</h3>
                        <p className="text-gray-600 text-sm">
                          Customized treatments based on your preferences and history
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">Loyalty Rewards</h3>
                        <p className="text-gray-600 text-sm">
                          Earn points with every visit and redeem for free services
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Statistics */}
              <div className="mt-8 p-6 bg-dynamic-surface rounded-2xl border border-dynamic-border shadow-sm">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-dynamic-primary mb-1">500+</div>
                    <div className="text-xs text-dynamic-text-secondary">Happy Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-dynamic-primary mb-1">4.9</div>
                    <div className="text-xs text-dynamic-text-secondary">Member Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-dynamic-primary mb-1">25%</div>
                    <div className="text-xs text-dynamic-text-secondary">Average Savings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Access Section */}
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 shadow-sm">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-light text-gray-800 mb-3">
                  Visiting as a Guest?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  No problem! You can still enjoy our premium services. 
                  Check in as a walk-in guest or schedule an appointment online.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/check-in">
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:border-dynamic-primary hover:text-dynamic-primary transition-colors rounded-full px-6 py-2 flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Walk-in Check In
                    </Button>
                  </Link>
                  
                  <Link to="/booking">
                    <Button
                      className="bg-dynamic-primary text-white hover:bg-dynamic-primary-hover transition-colors rounded-full px-6 py-2 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Note */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-dynamic-text-secondary text-sm">
              <Shield className="h-4 w-4" />
              <span>Your information is secure and protected</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
