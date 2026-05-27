import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  UserCircle,
  LayoutDashboard,
  Home
} from 'lucide-react';

interface TopRightUserProfileProps {
  // Remove props since we'll get auth state directly from context
}

const TopRightUserProfile: React.FC<TopRightUserProfileProps> = () => {
  const { logout, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug auth state
  useEffect(() => {
    // Optional: Add any side effects when auth state changes
  }, [isAuthenticated, user, loading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    // Navigate to profile page based on role
    if (user?.role === 'CUSTOMER') {
      navigate('/profile');
    } else {
      navigate('/admin/profile');
    }
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    // Navigate to settings page based on role
    if (user?.role === 'CUSTOMER') {
      navigate('/settings');
    } else {
      navigate('/admin/settings');
    }
  };

  const handleDashboardClick = () => {
    setIsDropdownOpen(false);
    navigate('/admin');
  };

  const handleHomeClick = () => {
    setIsDropdownOpen(false);
    navigate('/');
  };

  // Check if we're currently on the admin dashboard
  const isOnAdminDashboard = location.pathname === '/admin';



  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'MANAGER': return 'Manager';
      case 'FRONT_DESK': return 'Front Desk';
      case 'TECHNICIAN': return 'Technician';
      case 'CUSTOMER': return 'Customer';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'ADMIN': return 'bg-dynamic-primary/10 text-dynamic-primary border border-dynamic-primary/20';
      case 'MANAGER': return 'bg-dynamic-accent/10 text-dynamic-accent border border-dynamic-accent/20';
      case 'FRONT_DESK': return 'bg-dynamic-accent/10 text-dynamic-accent border border-dynamic-accent/20';
      case 'TECHNICIAN': return 'bg-dynamic-primary/10 text-dynamic-primary border border-dynamic-primary/20';
      case 'CUSTOMER': return 'bg-dynamic-text-secondary/10 text-dynamic-text-secondary border border-dynamic-border';
      default: return 'bg-dynamic-text-secondary/10 text-dynamic-text-secondary border border-dynamic-border';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse w-20 h-8 bg-dynamic-border rounded"></div>
        <div className="animate-pulse w-20 h-8 bg-dynamic-border rounded"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          to="/login"
          className="text-sm font-medium text-dynamic-text hover:text-dynamic-primary transition-all duration-200 px-3 py-2 rounded-lg hover:bg-dynamic-primary/10"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-dynamic-primary to-dynamic-primary-hover hover:from-dynamic-primary-hover hover:to-dynamic-primary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-dynamic-surface/80 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dynamic-primary to-dynamic-primary-hover shadow-lg flex items-center justify-center text-white font-semibold text-sm ring-2 ring-dynamic-primary/20">
            {user?.name ? getInitials(user.name) : <UserCircle className="w-6 h-6" />}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user?.role || 'CUSTOMER')}`}>
              {getRoleDisplayName(user?.role || 'CUSTOMER')}
            </span>
          </div>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown className={`w-4 h-4 text-dynamic-text-secondary transition-all duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-dynamic-surface rounded-xl shadow-2xl border border-dynamic-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-dynamic-border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dynamic-primary to-dynamic-primary-hover shadow-lg flex items-center justify-center text-white font-semibold text-base ring-2 ring-dynamic-primary/20">
                {user?.name ? getInitials(user.name) : <UserCircle className="w-7 h-7" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dynamic-text truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-dynamic-text-secondary truncate">
                  {user?.email || 'No email'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Dashboard/Home toggle - Only for staff roles */}
            {user?.role && user.role !== 'CUSTOMER' && (
              <button
                onClick={isOnAdminDashboard ? handleHomeClick : handleDashboardClick}
                className="w-full flex items-center px-4 py-3 text-sm text-dynamic-text hover:bg-dynamic-primary/10 hover:text-dynamic-primary transition-all duration-200 rounded-lg mx-2"
              >
                {isOnAdminDashboard ? (
                  <>
                    <Home className="w-4 h-4 mr-3 text-dynamic-text-secondary" />
                    Home Page
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-4 h-4 mr-3 text-dynamic-text-secondary" />
                    Admin Dashboard
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center px-4 py-3 text-sm text-dynamic-text hover:bg-dynamic-primary/10 hover:text-dynamic-primary transition-all duration-200 rounded-lg mx-2"
            >
              <User className="w-4 h-4 mr-3 text-dynamic-text-secondary" />
              Profile
            </button>
            
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center px-4 py-3 text-sm text-dynamic-text hover:bg-dynamic-primary/10 hover:text-dynamic-primary transition-all duration-200 rounded-lg mx-2"
            >
              <Settings className="w-4 h-4 mr-3 text-dynamic-text-secondary" />
              Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-dynamic-border py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm text-dynamic-primary hover:bg-dynamic-primary/10 hover:text-dynamic-primary-dark transition-all duration-200 rounded-lg mx-2"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopRightUserProfile;
