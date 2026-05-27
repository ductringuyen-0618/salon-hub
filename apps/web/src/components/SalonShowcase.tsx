import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SalonShowcase = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            Five Nails & Spa
          </h1>
          <p className="text-xl text-muted-foreground">
            Experience luxury nail care in a relaxing environment. Our skilled
            technicians provide exceptional service using premium products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/book")}
              className="text-lg text-white hover:opacity-90 transition-all duration-200"
              style={{backgroundColor: '#d34000'}}
            >
              Book Appointment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/check-in")}
              className="text-lg"
            >
              Walk-in Check In
            </Button>
          </div>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <img
              src="https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&q=80"
              alt="Five Nails & Spa"
              className="w-full h-[300px] object-cover"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary h-8 w-8"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Premium Products</h3>
            <p className="text-muted-foreground">
              We use only the highest quality, non-toxic products for your
              safety and satisfaction.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary h-8 w-8"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Efficient Service</h3>
            <p className="text-muted-foreground">
              Our online check-in system minimizes wait times and maximizes your
              convenience.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary h-8 w-8"
              >
                <path d="M20 7h-9"></path>
                <path d="M14 17H5"></path>
                <circle cx="17" cy="17" r="3"></circle>
                <circle cx="7" cy="7" r="3"></circle>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Skilled Technicians</h3>
            <p className="text-muted-foreground">
              Our experienced staff are trained in the latest techniques and
              styles.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalonShowcase;
