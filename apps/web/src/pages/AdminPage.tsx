import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import {
  Users,
  Calendar,
  Settings,
  BarChart3,
  Clock,
  Palette,
  UserCheck,
  CreditCard
} from 'lucide-react';

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  const adminActions = [
    {
      title: 'Staff Management',
      description: 'Manage staff members, roles, and permissions',
      icon: Users,
      href: '/admin/staff',
      color: 'bg-blue-500'
    },
    {
      title: 'Wait List Management',
      description: 'View and manage customer wait lists',
      icon: Clock,
      href: '/waitlist',
      color: 'bg-green-500'
    },
    {
      title: 'Booking Management',
      description: 'View and manage appointments',
      icon: Calendar,
      href: '/admin/bookings',
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View business analytics and reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-orange-500'
    },
    {
      title: 'Color Theme Manager',
      description: 'Customize salon branding and colors',
      icon: Palette,
      href: '/admin/themes',
      color: 'bg-pink-500'
    },
    {
      title: 'Payment Settings',
      description: 'Manage payment methods and pricing',
      icon: CreditCard,
      href: '/admin/payments',
      color: 'bg-yellow-500'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500'
    },
    {
      title: 'Check-in Management',
      description: 'Monitor customer check-ins',
      icon: UserCheck,
      href: '/admin/checkins',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-dynamic-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dynamic-primary mb-2">
            Admin Dashboard
          </h1>
          <p className="text-dynamic-text-secondary">
            Welcome back, {user?.name}! Manage your salon from here.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dynamic-surface border-dynamic-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dynamic-text-secondary">Today's Appointments</p>
                  <p className="text-2xl font-bold text-dynamic-primary">12</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dynamic-surface border-dynamic-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dynamic-text-secondary">Wait List</p>
                  <p className="text-2xl font-bold text-dynamic-primary">5</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dynamic-surface border-dynamic-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dynamic-text-secondary">Active Staff</p>
                  <p className="text-2xl font-bold text-dynamic-primary">8</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dynamic-surface border-dynamic-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dynamic-text-secondary">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-dynamic-primary">$12,450</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div>
          <h2 className="text-xl font-semibold text-dynamic-text mb-6">
            Management Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {adminActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.title} className="bg-dynamic-surface border-dynamic-border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg text-dynamic-text">
                        {action.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-dynamic-text-secondary mb-4">
                      {action.description}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                    >
                      <Link to={action.href}>
                        Access
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 bg-dynamic-surface border-dynamic-border">
          <CardHeader>
            <CardTitle className="text-dynamic-text">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-dynamic-text-secondary">
                  New customer checked in - Sarah Johnson
                </span>
                <span className="text-dynamic-text-secondary text-xs">2 min ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-dynamic-text-secondary">
                  Appointment scheduled - Michael Chen
                </span>
                <span className="text-dynamic-text-secondary text-xs">5 min ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-dynamic-text-secondary">
                  Payment received - $65.00
                </span>
                <span className="text-dynamic-text-secondary text-xs">12 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
