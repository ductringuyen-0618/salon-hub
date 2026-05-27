import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Calendar, Sparkles, ArrowRight, Users, Award, CheckCircle, Scissors, Crown, Palette } from "lucide-react";

const ServicesPage = () => {
  const navigate = useNavigate();

  // Enhanced service data with better organization
  const serviceCategories = [
    {
      id: 1,
      icon: <Scissors className="h-8 w-8" />,
      category: "Manicure Services",
      description: "Professional nail care for beautiful, healthy hands",
      color: "bg-blue-50 border-blue-200",
      services: [
        { 
          name: "Signature Manicure", 
          price: 45, 
          duration: 60, 
          description: "Complete nail care with cuticle treatment, shaping, and luxury hand massage",
          popular: true 
        },
        { 
          name: "Express Manicure", 
          price: 25, 
          duration: 30, 
          description: "Quick nail shaping, cuticle care, and polish application" 
        },
        { 
          name: "Gel Manicure", 
          price: 35, 
          duration: 45, 
          description: "Long-lasting gel polish with chip-resistant finish" 
        },
        { 
          name: "French Manicure", 
          price: 40, 
          duration: 50, 
          description: "Classic French tips with precision and elegance" 
        },
      ],
    },
    {
      id: 2,
      icon: <Sparkles className="h-8 w-8" />,
      category: "Pedicure Services", 
      description: "Rejuvenating foot treatments for complete relaxation",
      color: "bg-green-50 border-green-200",
      services: [
        { 
          name: "Deluxe Pedicure", 
          price: 65, 
          duration: 75, 
          description: "Ultimate foot treatment with exfoliation, hot stone massage, and paraffin",
          popular: true 
        },
        { 
          name: "Classic Pedicure", 
          price: 35, 
          duration: 45, 
          description: "Essential foot care with nail trimming, shaping, and polish" 
        },
        { 
          name: "Spa Pedicure", 
          price: 50, 
          duration: 60, 
          description: "Relaxing treatment with callus removal and foot massage" 
        },
        { 
          name: "Medical Pedicure", 
          price: 70, 
          duration: 60, 
          description: "Therapeutic treatment for foot health and nail care" 
        },
      ],
    },
    {
      id: 3,
      icon: <Crown className="h-8 w-8" />,
      category: "Nail Enhancements",
      description: "Extensions and strengthening for gorgeous, long-lasting nails",
      color: "bg-purple-50 border-purple-200",
      services: [
        { 
          name: "Acrylic Full Set", 
          price: 55, 
          duration: 90, 
          description: "Complete acrylic nail application with custom shaping and length" 
        },
        { 
          name: "Gel Extensions", 
          price: 60, 
          duration: 90, 
          description: "Natural-looking gel extensions with superior durability" 
        },
        { 
          name: "Dip Powder", 
          price: 45, 
          duration: 60, 
          description: "Healthy nail strengthening with beautiful color finish" 
        },
        { 
          name: "Fill & Maintenance", 
          price: 35, 
          duration: 45, 
          description: "Professional maintenance for existing nail enhancements" 
        },
      ],
    },
    {
      id: 4,
      icon: <Palette className="h-8 w-8" />,
      category: "Nail Art & Design",
      description: "Creative artistic designs for unique, personalized nails",
      color: "bg-pink-50 border-pink-200",
      services: [
        { 
          name: "Custom Nail Art", 
          price: 15, 
          duration: 30, 
          description: "Per nail artistic design created by our talented artists",
          popular: true 
        },
        { 
          name: "3D Nail Art", 
          price: 25, 
          duration: 45, 
          description: "Dimensional artwork with gems, charms, and textures" 
        },
        { 
          name: "Seasonal Designs", 
          price: 20, 
          duration: 35, 
          description: "Trendy seasonal themes and holiday-inspired art" 
        },
        { 
          name: "Bridal Package", 
          price: 150, 
          duration: 120, 
          description: "Complete bridal nail service with trial and wedding day application" 
        },
      ],
    },
  ];

  const addOnServices = [
    { name: "Cuticle Oil Treatment", price: 5, description: "Nourishing treatment for healthy cuticles" },
    { name: "Hand Mask", price: 10, description: "Moisturizing mask for soft, smooth hands" },
    { name: "Paraffin Treatment", price: 15, description: "Therapeutic wax treatment for deep moisturizing" },
    { name: "Hot Stone Massage", price: 20, description: "Relaxing hot stone therapy for hands and arms" },
  ];

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation
        showBackButton={true}
        title="Our Services"
        subtitle="Premium nail care and wellness treatments"
      />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <Badge className="bg-dynamic-primary/10 text-dynamic-primary border-dynamic-primary/20 mb-6">
              ✨ PROFESSIONAL NAIL SERVICES
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-light text-dynamic-text mb-6">
              Discover Our
              <span className="text-dynamic-primary font-light italic block">Premium Services</span>
            </h1>
            
            <p className="text-xl text-dynamic-text-secondary leading-relaxed mb-8">
              From classic manicures to artistic nail designs, our expert technicians provide 
              exceptional care using the finest products and latest techniques.
            </p>

            <Button
              onClick={() => navigate("/booking")}
              className="bg-dynamic-primary text-white px-8 py-3 rounded-full hover:bg-dynamic-primary-hover transition-all duration-300 text-lg flex items-center gap-2 mx-auto"
            >
              <Calendar className="h-5 w-5" />
              Book Your Appointment
            </Button>
          </div>
        </div>

        {/* Service Categories */}
        <div className="space-y-16">
          {serviceCategories.map((category) => (
            <div key={category.id} className="space-y-8">
              {/* Category Header */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="text-dynamic-primary">
                    {category.icon}
                  </div>
                  <h2 className="text-3xl font-light text-dynamic-text">
                    {category.category}
                  </h2>
                </div>
                <p className="text-lg text-dynamic-text-secondary max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.services.map((service, index) => (
                  <Card 
                    key={index} 
                    className="bg-dynamic-surface border-dynamic-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium text-dynamic-text">{service.name}</h3>
                            {service.popular && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-dynamic-text-secondary text-sm mb-4 leading-relaxed">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-dynamic-text-secondary mb-4">
                            <Clock className="h-4 w-4" />
                            {service.duration} min
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-semibold text-dynamic-primary">
                          ${service.price}
                        </div>
                        <Button
                          onClick={() => navigate("/booking")}
                          size="sm"
                          className="bg-dynamic-primary text-white rounded-full hover:bg-dynamic-primary-hover transition-colors"
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add-On Services */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-dynamic-text mb-4">
              Enhancement Add-Ons
            </h2>
            <p className="text-lg text-dynamic-text-secondary max-w-2xl mx-auto">
              Enhance your experience with our luxurious add-on treatments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOnServices.map((addon, index) => (
              <Card key={index} className="bg-gradient-to-br from-dynamic-primary/5 to-dynamic-accent/5 border-dynamic-border">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-dynamic-primary mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-dynamic-text mb-2">{addon.name}</h3>
                  <p className="text-dynamic-text-secondary text-sm mb-3">{addon.description}</p>
                  <div className="text-xl font-semibold text-dynamic-primary">+${addon.price}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Packages Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-dynamic-text mb-4">
              Special Packages
            </h2>
            <p className="text-lg text-dynamic-text-secondary max-w-2xl mx-auto">
              Save with our curated service combinations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Relaxation Package */}
            <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-dynamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-dynamic-primary" />
                </div>
                <CardTitle className="text-2xl font-light text-dynamic-text">Relaxation Package</CardTitle>
                <p className="text-dynamic-text-secondary">Perfect for ultimate pampering</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Deluxe Pedicure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Signature Manicure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Paraffin Treatment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Hot Stone Massage</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-dynamic-primary mb-2">$120</div>
                  <p className="text-sm text-dynamic-text-secondary mb-4">Save $25</p>
                  <Button
                    onClick={() => navigate("/booking")}
                    className="w-full bg-dynamic-primary text-white rounded-full hover:bg-dynamic-primary-hover"
                  >
                    Book Package
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bridal Package */}
            <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-dynamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-dynamic-primary" />
                </div>
                <CardTitle className="text-2xl font-light text-dynamic-text">Bridal Package</CardTitle>
                <p className="text-dynamic-text-secondary">Special day perfection</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Trial Session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Wedding Day Service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Custom Nail Art</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Touch-up Kit</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-dynamic-primary mb-2">$200</div>
                  <p className="text-sm text-dynamic-text-secondary mb-4">Complete bridal experience</p>
                  <Button
                    onClick={() => navigate("/booking")}
                    className="w-full bg-dynamic-primary text-white rounded-full hover:bg-dynamic-primary-hover"
                  >
                    Book Package
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Membership */}
            <Card className="bg-dynamic-surface border-dynamic-border shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-dynamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-dynamic-primary" />
                </div>
                <CardTitle className="text-2xl font-light text-dynamic-text">VIP Membership</CardTitle>
                <p className="text-dynamic-text-secondary">Monthly unlimited access</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">2 Full Services/Month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Priority Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">20% Off Add-ons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-dynamic-primary" />
                    <span className="text-dynamic-text-secondary">Free Maintenance</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-dynamic-primary mb-2">$99</div>
                  <p className="text-sm text-dynamic-text-secondary mb-4">per month</p>
                  <Button
                    onClick={() => navigate("/booking")}
                    className="w-full bg-dynamic-primary text-white rounded-full hover:bg-dynamic-primary-hover"
                  >
                    Join VIP
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-dynamic-primary/5 to-dynamic-accent/5 border-dynamic-border shadow-lg">
            <CardContent className="p-12">
              <Sparkles className="h-16 w-16 text-dynamic-primary mx-auto mb-6" />
              <h2 className="text-3xl font-light text-dynamic-text mb-4">
                Ready to Experience Luxury?
              </h2>
              <p className="text-xl text-dynamic-text-secondary mb-8 max-w-2xl mx-auto">
                Book your appointment today and discover why we're the premier destination for nail care and wellness
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/booking")}
                  className="bg-dynamic-primary text-white px-8 py-3 rounded-full hover:bg-dynamic-primary-hover transition-all duration-300 text-lg flex items-center gap-2 justify-center"
                >
                  <Calendar className="h-5 w-5" />
                  Book Online Now
                </Button>
                
                <Button
                  onClick={() => navigate("/check-in")}
                  variant="outline"
                  className="border-2 border-dynamic-border text-dynamic-text px-8 py-3 rounded-full hover:border-dynamic-primary hover:text-dynamic-primary transition-all duration-300 text-lg flex items-center gap-2 justify-center"
                >
                  <Users className="h-5 w-5" />
                  Walk-in Welcome
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ServicesPage;
