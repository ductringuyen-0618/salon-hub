import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TopRightUserProfile from './TopRightUserProfile';
import {
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  showBackButton?: boolean;
  backTo?: string;
  title?: string;
  subtitle?: string;
}

const Navigation: React.FC<NavigationProps> = ({
  showBackButton = false,
  backTo = '/',
  title,
  subtitle
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-dynamic-surface shadow-sm border-b border-dynamic-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backTo)}
                className="lg:hidden flex items-center gap-2 text-dynamic-text hover:text-dynamic-primary hover:bg-dynamic-primary/10 transition-colors font-light"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            )}
            <div className="flex-shrink-0">
              <Link to="/">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-dynamic-text hover:text-dynamic-primary transition-colors tracking-wide">
                  {title || 'Five Nails & Spa'}
                </h1>
              </Link>
              {subtitle && (
                <p className="text-xs sm:text-sm text-dynamic-text-secondary mt-1 font-light tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <nav className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-dynamic-text hover:text-dynamic-primary transition-colors font-light tracking-wide"
              >
                Home
              </Link>
              <Link
                to="/services"
                className="text-dynamic-text hover:text-dynamic-primary transition-colors font-light tracking-wide"
              >
                Services
              </Link>
              <Link
                to="/check-in"
                className="text-dynamic-text hover:text-dynamic-primary transition-colors font-light tracking-wide"
              >
                Check In
              </Link>
            </nav>
          </div>

          {/* Right side - User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <TopRightUserProfile />
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-dynamic-text hover:text-dynamic-primary hover:bg-dynamic-primary/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Mobile menu backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile menu content */}
            <div className="lg:hidden absolute top-full left-0 right-0 bg-dynamic-surface border-b border-dynamic-border shadow-lg z-50 animate-in slide-in-from-top duration-300">
              <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-4">
                <Link
                  to="/"
                  className="block text-dynamic-text hover:text-dynamic-primary transition-colors font-light tracking-wide py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  className="block text-dynamic-text hover:text-dynamic-primary transition-colors font-light tracking-wide py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  to="/check-in"
                  className="block text-dynamic-text hover:text-dynamic-primary transition-colors font-light tracking-wide py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Check In
                </Link>
              </div>

              {/* Mobile User Profile */}
              <div className="pt-4 border-t border-dynamic-border">
                <TopRightUserProfile />
              </div>
            </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navigation;
