import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Calendar, Sparkles, ArrowRight, Users, Award, CheckCircle, Scissors, Crown, Palette, Loader2 } from "lucide-react";
import { apiService, Service } from "@/services/api";

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
  "Manicure Services": <Scissors className="h-8 w-8" />,
  "Pedicure Services": <Sparkles className="h-8 w-8" />,
  "Nail Enhancements": <Crown className="h-8 w-8" />,
  "Nail Art & Design": <Palette className="h-8 w-8" />,
  "Add-On Services": <CheckCircle className="h-8 w-8" />,
  "Combo Packages": <Award className="h-8 w-8" />,
};

// Category colors for styling
const categoryColors: Record<string, string> = {
  "Manicure Services": "bg-dynamic-primary/10 border-dynamic-primary/20",
  "Pedicure Services": "bg-dynamic-accent/10 border-dynamic-accent/20",
  "Nail Enhancements": "bg-dynamic-primary/5 border-dynamic-border",
  "Nail Art & Design": "bg-dynamic-accent/5 border-dynamic-accent/15",
  "Add-On Services": "bg-dynamic-primary/5 border-dynamic-primary/10",
  "Combo Packages": "bg-gradient-to-r from-dynamic-primary/10 to-dynamic-accent/10 border-dynamic-border",
};

// Category descriptions
const categoryDescriptions: Record<string, string> = {
  "Manicure Services": "Professional nail care for beautiful, healthy hands",
  "Pedicure Services": "Rejuvenating foot treatments for complete relaxation",
  "Nail Enhancements": "Extensions and strengthening for gorgeous, long-lasting nails",
  "Nail Art & Design": "Creative artistic designs for unique, personalized nails",
  "Add-On Services": "Enhance your experience with luxurious add-on treatments",
  "Combo Packages": "Save with our curated service combinations",
};

interface ServiceCategory {
  category: string;
  services: Service[];
  icon: React.ReactNode;
  color: string;
  description: string;
}

const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await apiService.getServices();
        // Filter only active services
        setServices(data.filter(s => s.active !== false));
        setError(null);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError('Unable to load services. Please try again later.');
        // Keep empty array - no fallback to hardcoded data
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Group services by category
  const serviceCategories: ServiceCategory[] = React.useMemo(() => {
    const categoryMap = new Map<string, Service[]>();
    
    services.forEach(service => {
      const cat = service.category || 'Other Services';
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, []);
      }
      categoryMap.get(cat)!.push(service);
    });

    // Define category order
    const categoryOrder = [
      "Manicure Services",
      "Pedicure Services", 
      "Nail Enhancements",
      "Nail Art & Design",
      "Add-On Services",
      "Combo Packages",
    ];

    return categoryOrder
      .filter(cat => categoryMap.has(cat))
      .map(cat => ({
        category: cat,
        services: categoryMap.get(cat)!,
        icon: categoryIcons[cat] || <Sparkles className="h-8 w-8" />,
        color: categoryColors[cat] || "bg-dynamic-surface border-dynamic-border",
        description: categoryDescriptions[cat] || "",
      }));
  }, [services]);

  // Separate add-on services for special display
  const addOnServices = services.filter(s => s.category === "Add-On Services");
  const mainCategories = serviceCategories.filter(c => c.category !== "Add-On Services" && c.category !== "Combo Packages");

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
              className="text-white px-8 py-3 rounded-full hover:opacity-90 transition-all duration-300 text-lg flex items-center gap-2 mx-auto"
              style={{backgroundColor: '#d34000'}}
            >
              <Calendar className="h-5 w-5" />
              Book Your Appointment
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-dynamic-primary mb-4" />
            <p className="text-dynamic-text-secondary">Loading services...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-dynamic-border"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Service Categories */}
        {!loading && !error && (
          <div className="space-y-16">
            {mainCategories.map((category) => (
              <div key={category.category} className="space-y-8">
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
                  {category.services.map((service) => (
                    <Card 
                      key={service.id} 
                      className="bg-dynamic-surface border-dynamic-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-medium text-dynamic-text">{service.name}</h3>
                              {service.popular && (
                                <Badge className="bg-dynamic-accent/20 text-dynamic-accent border-dynamic-accent/30 text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-dynamic-text-secondary text-sm mb-4 leading-relaxed">
                              {service.description || 'Premium service'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-dynamic-text-secondary mb-4">
                              <Clock className="h-4 w-4" />
                              {service.estimatedDurationMinutes || service.duration} min
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
                            className="text-white rounded-full hover:opacity-90 transition-all duration-200"
                            style={{backgroundColor: '#d34000'}}
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
        )}

        {/* Add-On Services */}
        {!loading && !error && addOnServices.length > 0 && (
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
              {addOnServices.map((addon) => (
                <Card key={addon.id} className="bg-gradient-to-br from-dynamic-primary/5 to-dynamic-accent/5 border-dynamic-border">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 text-dynamic-primary mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-dynamic-text mb-2">{addon.name}</h3>
                    <p className="text-dynamic-text-secondary text-sm mb-3">{addon.description || 'Premium add-on service'}</p>
                    <div className="text-xl font-semibold text-dynamic-primary">+${addon.price}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

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
                    className="w-full text-white rounded-full hover:opacity-90"
                    style={{backgroundColor: '#d34000'}}
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
                    className="w-full text-white rounded-full hover:opacity-90"
                    style={{backgroundColor: '#d34000'}}
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
                    className="w-full text-white rounded-full hover:opacity-90"
                    style={{backgroundColor: '#d34000'}}
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
                  className="text-white px-8 py-3 rounded-full hover:opacity-90 transition-all duration-300 text-lg flex items-center gap-2 justify-center"
                  style={{backgroundColor: '#d34000'}}
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
