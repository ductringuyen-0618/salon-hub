import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import {
  Sparkles,
  Clock,
  Star,
  Calendar,
  Users,
  Award,
  Heart,
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Premium Services",
      description: "Luxury nail care and wellness treatments using the finest products"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Sanitized Environment",
      description: "Hospital-grade sterilization and safety protocols for your peace of mind"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Technicians",
      description: "Certified professionals with years of experience and artistic expertise"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Relaxing Atmosphere",
      description: "Serene sanctuary designed for complete relaxation and rejuvenation"
    }
  ];

  const services = [
    {
      name: "Signature Manicure",
      price: "$45",
      duration: "60 min",
      popular: true,
      description: "Complete nail care with cuticle treatment and luxury hand massage"
    },
    {
      name: "Deluxe Pedicure",
      price: "$65",
      duration: "75 min",
      popular: true,
      description: "Rejuvenating foot treatment with exfoliation and hot stone massage"
    },
    {
      name: "Gel Polish",
      price: "$35",
      duration: "45 min",
      popular: false,
      description: "Long-lasting gel polish application with chip-resistant finish"
    },
    {
      name: "Nail Art Design",
      price: "$55",
      duration: "90 min",
      popular: false,
      description: "Custom artistic designs created by our talented nail artists"
    }
  ];

  const stats = [
    { label: "Happy Clients", value: "2,500+", icon: <Users className="h-6 w-6" /> },
    { label: "Years Experience", value: "8+", icon: <Award className="h-6 w-6" /> },
    { label: "Services Offered", value: "25+", icon: <Sparkles className="h-6 w-6" /> },
    { label: "Customer Rating", value: "4.9", icon: <Star className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation
        title="Five Nails & Spa"
        subtitle="Premium Wellness Experience"
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-dynamic-primary/10 text-dynamic-primary border-dynamic-primary/20 mb-6">
              ✨ LUXURY NAIL CARE & WELLNESS
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-dynamic-text mb-6 leading-tight">
              <span className="block">Indulge in</span>
              <span className="block text-dynamic-primary font-light italic">Pure Elegance</span>
            </h1>
            
            <p className="text-xl text-dynamic-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
              Experience the art of nail care in our serene sanctuary. Where luxury meets wellness,
              and every detail is crafted for your complete rejuvenation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              onClick={() => navigate("/booking")}
              className="bg-dynamic-primary text-white px-10 py-4 rounded-full hover:bg-dynamic-primary-hover transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              Reserve Your Experience
              <ArrowRight className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/check-in")}
              className="border-2 border-dynamic-border text-dynamic-text px-10 py-4 rounded-full hover:border-dynamic-primary hover:text-dynamic-primary transition-all duration-300 text-lg flex items-center gap-2"
            >
              Walk-in Welcome
              <Users className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-dynamic-surface border-dynamic-border shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-dynamic-primary mb-3 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-semibold text-dynamic-text mb-1">{stat.value}</div>
                  <div className="text-sm text-dynamic-text-secondary">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-dynamic-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-dynamic-text mb-4">Why Choose Five Nails & Spa</h2>
            <p className="text-xl text-dynamic-text-secondary max-w-2xl mx-auto">
              We combine luxury, expertise, and wellness to create an unparalleled experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-dynamic-background border-dynamic-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="text-dynamic-primary mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium text-dynamic-text mb-3">{feature.title}</h3>
                  <p className="text-dynamic-text-secondary leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-dynamic-text mb-4">Popular Services</h2>
            <p className="text-xl text-dynamic-text-secondary max-w-2xl mx-auto">
              Discover our most loved treatments designed for your ultimate relaxation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-dynamic-surface border-dynamic-border shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-medium text-dynamic-text">{service.name}</h3>
                        {service.popular && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-dynamic-text-secondary mb-4 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-dynamic-text-secondary">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {service.duration}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-semibold text-dynamic-primary mb-2">
                        {service.price}
                      </div>
                      <Button
                        onClick={() => navigate("/booking")}
                        className="bg-dynamic-primary text-white px-4 py-2 rounded-full hover:bg-dynamic-primary-hover transition-colors text-sm"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate("/services")}
              variant="outline"
              className="border-2 border-dynamic-primary text-dynamic-primary px-8 py-3 rounded-full hover:bg-dynamic-primary hover:text-white transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              View All Services
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-dynamic-primary/5 to-dynamic-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-dynamic-surface rounded-3xl p-12 shadow-lg border border-dynamic-border">
            <Sparkles className="h-16 w-16 text-dynamic-primary mx-auto mb-6" />
            <h2 className="text-3xl font-light text-dynamic-text mb-4">
              Ready for Your Wellness Journey?
            </h2>
            <p className="text-xl text-dynamic-text-secondary mb-8 max-w-2xl mx-auto">
              Book your appointment today and experience the perfect blend of luxury and relaxation
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/booking")}
                className="bg-dynamic-primary text-white px-8 py-3 rounded-full hover:bg-dynamic-primary-hover transition-all duration-300 text-lg flex items-center gap-2 justify-center"
              >
                <Calendar className="h-5 w-5" />
                Schedule Appointment
              </Button>
              
              <Button
                onClick={() => navigate("/services")}
                variant="outline"
                className="border-2 border-dynamic-border text-dynamic-text px-8 py-3 rounded-full hover:border-dynamic-primary hover:text-dynamic-primary transition-all duration-300 text-lg flex items-center gap-2 justify-center"
              >
                <Sparkles className="h-5 w-5" />
                Explore Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dynamic-surface border-t border-dynamic-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-light text-dynamic-text mb-4">Five Nails & Spa</h3>
              <p className="text-dynamic-text-secondary mb-4 max-w-md">
                Your premier destination for luxury nail care and wellness treatments. 
                Experience the art of relaxation in our serene sanctuary.
              </p>
              <div className="flex items-center gap-2 text-dynamic-text-secondary">
                <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                <span className="text-sm">Licensed & Insured</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-dynamic-text mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/services" className="block text-dynamic-text-secondary hover:text-dynamic-primary transition-colors">Services</Link>
                <Link to="/booking" className="block text-dynamic-text-secondary hover:text-dynamic-primary transition-colors">Book Online</Link>
                <Link to="/check-in" className="block text-dynamic-text-secondary hover:text-dynamic-primary transition-colors">Check In</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-dynamic-text mb-4">Contact</h4>
              <div className="space-y-2 text-dynamic-text-secondary text-sm">
                <p>123 Wellness Drive</p>
                <p>Spa City, SC 12345</p>
                <p>(555) 123-4567</p>
                <p>info@fivenailsspa.com</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-dynamic-border mt-8 pt-8 text-center">
            <p className="text-dynamic-text-secondary text-sm">
              © 2024 Five Nails & Spa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
