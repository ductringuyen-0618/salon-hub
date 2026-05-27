import React, { useState } from "react";
import CheckInForm from "@/components/CheckInForm";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  UserCheck, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Crown,
  Gift,
  Calendar,
  Heart
} from "lucide-react";

const CheckInPage = () => {
  const [showMemberLogin, setShowMemberLogin] = useState(false);

  if (showMemberLogin) {
    return (
      <div className="min-h-screen bg-dynamic-background">
        <Navigation
          showBackButton={true}
          title="Member Login"
          subtitle="Sign in to your member account"
        />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
              <CardHeader className="text-center">
                <Crown className="h-12 w-12 text-dynamic-primary mx-auto mb-4" />
                <CardTitle className="text-2xl font-light text-dynamic-text">
                  Member Login Required
                </CardTitle>
                <p className="text-dynamic-text-secondary">
                  Access your member account for exclusive benefits
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-dynamic-primary" />
                    <span>Priority booking and scheduling</span>
                  </div>
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-dynamic-primary" />
                    <span>Exclusive member discounts</span>
                  </div>
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-dynamic-primary" />
                    <span>Service history and preferences</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link to="/login">
                    <Button className="w-full text-white hover:opacity-90 transition-colors rounded-full py-3">
                      <Crown className="h-4 w-4 mr-2" />
                      Member Login
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowMemberLogin(false)}
                    className="w-full border-dynamic-border hover:border-dynamic-primary hover:text-dynamic-primary transition-colors rounded-full py-3"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Continue as Guest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation
        showBackButton={true}
        title="Walk-in Check In"
        subtitle="Welcome! Let's get you checked in for your visit"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="max-w-2xl mx-auto">
              <Badge className="bg-dynamic-primary/10 text-dynamic-primary border-dynamic-primary/20 mb-6">
                ✨ WALK-IN WELCOME
              </Badge>
              
              <h1 className="text-3xl md:text-4xl font-light text-dynamic-text mb-4">
                Welcome to
                <span className="text-dynamic-primary font-light italic block">Five Nails & Spa</span>
              </h1>
              
              <p className="text-lg text-dynamic-text-secondary leading-relaxed">
                We're delighted to have you visit us today. Please check in below and we'll get you started on your wellness journey.
              </p>
            </div>
          </div>

          {/* Options Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Guest Check-in */}
            <Card className="bg-dynamic-surface border-dynamic-border shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-light text-dynamic-text">Guest Check-In</CardTitle>
                <p className="text-dynamic-text-secondary">
                  First time visiting or prefer not to create an account
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>Quick and easy check-in process</span>
                  </div>
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>No account creation required</span>
                  </div>
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>Access to all services</span>
                  </div>
                </div>
                <p className="text-sm text-dynamic-text-secondary text-center mb-4">
                  Continue with guest check-in below
                </p>
              </CardContent>
            </Card>

            {/* Member Check-in */}
            <Card className="bg-gradient-to-br from-dynamic-primary/5 to-dynamic-accent/5 border-dynamic-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-dynamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-dynamic-primary" />
                </div>
                <CardTitle className="text-2xl font-light text-dynamic-text">Member Check-In</CardTitle>
                <p className="text-dynamic-text-secondary">
                  Existing member with exclusive benefits
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-dynamic-primary" />
                    <span>Priority booking and faster service</span>
                  </div>
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-dynamic-primary" />
                    <span>Exclusive member pricing and discounts</span>
                  </div>
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-dynamic-primary" />
                    <span>Personalized service preferences</span>
                  </div>
                  <div className="flex items-center gap-3 text-dynamic-text-secondary">
                    <CheckCircle className="h-5 w-5 text-dynamic-primary" />
                    <span>Loyalty points and rewards</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowMemberLogin(true)}
                  className="w-full bg-dynamic-primary text-white hover:bg-dynamic-primary-hover transition-colors rounded-full py-3 flex items-center justify-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  Member Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Current Wait Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-dynamic-surface border-dynamic-border shadow-sm">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-dynamic-primary mx-auto mb-3" />
                <div className="text-2xl font-semibold text-dynamic-text mb-1">15 min</div>
                <div className="text-sm text-dynamic-text-secondary">Current Wait</div>
              </CardContent>
            </Card>
            
            <Card className="bg-dynamic-surface border-dynamic-border shadow-sm">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-dynamic-primary mx-auto mb-3" />
                <div className="text-2xl font-semibold text-dynamic-text mb-1">3 people</div>
                <div className="text-sm text-dynamic-text-secondary">Ahead of You</div>
              </CardContent>
            </Card>
            
            <Card className="bg-dynamic-surface border-dynamic-border shadow-sm">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-dynamic-primary mx-auto mb-3" />
                <div className="text-2xl font-semibold text-dynamic-text mb-1">4.9/5</div>
                <div className="text-sm text-dynamic-text-secondary">Customer Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Guest Check-in Form */}
          <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
            <CardHeader className="text-center">
              <UserCheck className="h-12 w-12 text-dynamic-primary mx-auto mb-4" />
              <CardTitle className="text-2xl font-light text-dynamic-text">
                Guest Check-In Form
              </CardTitle>
              <p className="text-dynamic-text-secondary">
                Please fill out the form below to get started
              </p>
            </CardHeader>
            <CardContent>
              <CheckInForm />
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-dynamic-primary/5 to-dynamic-accent/5 border-dynamic-border">
              <CardContent className="p-8">
                <Heart className="h-12 w-12 text-dynamic-primary mx-auto mb-4" />
                <h3 className="text-xl font-light text-dynamic-text mb-3">
                  First Time Visiting?
                </h3>
                <p className="text-dynamic-text-secondary mb-6 max-w-2xl mx-auto">
                  Welcome to Five Nails & Spa! We're excited to provide you with an exceptional experience. 
                  Our expert technicians will ensure you receive the highest quality care in our relaxing environment.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/services">
                    <Button
                      variant="outline"
                      className="border-dynamic-border hover:border-dynamic-primary hover:text-dynamic-primary transition-colors rounded-full px-6 py-2 flex items-center gap-2"
                    >
                      <Gift className="h-4 w-4" />
                      View Our Services
                    </Button>
                  </Link>
                  
                  <Link to="/booking">
                    <Button
                      className="bg-dynamic-primary text-white hover:bg-dynamic-primary-hover transition-colors rounded-full px-6 py-2 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Book Future Appointment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckInPage;
