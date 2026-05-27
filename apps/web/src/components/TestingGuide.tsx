import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Eye, EyeOff, Info, Palette } from 'lucide-react';
import { mockUsers, mockCustomersQueue } from '../lib/mockData';
import { services, mockBookings } from '../lib/bookingData';
import { USE_MOCK_API } from '../services/mockApi';

const TestingGuide = () => {
  const [showPasswords, setShowPasswords] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'EMPLOYEE':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Testing Guide & Mock Data
          </CardTitle>
          <CardDescription>
            Use this guide to test all functionality with mock data. Toggle between mock and real API easily.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Mode:</strong> {USE_MOCK_API ? 'Mock API (Testing Mode)' : 'Real Backend API'}
              <br />
              To switch modes, change <code>VITE_USE_MOCK_API</code> in your <code>.env.local</code> file.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="routing" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="routing">Routing Tests</TabsTrigger>
              <TabsTrigger value="accounts">Test Accounts</TabsTrigger>
              <TabsTrigger value="queue">Mock Queue Data</TabsTrigger>
              <TabsTrigger value="booking">Booking System</TabsTrigger>
              <TabsTrigger value="colors">Color Themes</TabsTrigger>
              <TabsTrigger value="setup">Setup Instructions</TabsTrigger>
            </TabsList>

            <TabsContent value="routing" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Application Routes Test</h3>
                <p className="text-sm text-muted-foreground">
                  Test all application routes to ensure proper navigation and page loading.
                </p>
                
                <div className="grid gap-3">
                  {[
                    { path: '/', name: 'Home Page', description: 'Main landing page with hero section' },
                    { path: '/check-in', name: 'Check-In Page', description: 'Guest and member check-in forms' },
                    { path: '/login', name: 'Login Page', description: 'User authentication' },
                    { path: '/register', name: 'Register Page', description: 'New user registration' },
                    { path: '/book', name: 'Booking Page', description: 'Service booking and appointments' },
                    { path: '/services', name: 'Services Page', description: 'Available salon services' },
                    { path: '/colors', name: 'Color Demo', description: 'Dynamic color theme showcase' },
                    { path: '/waitlist', name: 'Wait List', description: 'Current queue status' },
                    { path: '/admin', name: 'Admin Dashboard', description: 'Admin-only dashboard (requires login)' },
                    { path: '/testing', name: 'Testing Guide', description: 'This testing documentation' },
                  ].map((route) => (
                    <Card key={route.path} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{route.path}</code>
                            <span className="font-medium">{route.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{route.description}</p>
                        </div>
                        <Link to={route.path}>
                          <Button variant="outline" size="sm">
                            Test Route
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Protected Routes:</strong> The admin routes require authentication with ADMIN or MANAGER role. 
                    Test with admin credentials from the Test Accounts tab.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Available Test Accounts</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPasswords ? 'Hide' : 'Show'} Passwords
                </Button>
              </div>

              <div className="grid gap-4">
                {mockUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Email:</span>
                            <code className="bg-muted px-1 rounded">{user.email}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(user.email)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {showPasswords && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Password:</span>
                              <code className="bg-muted px-1 rounded">{user.password}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(user.password)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {user.preferredServices && (
                            <div>
                              <span className="font-medium">Preferred Services:</span> {user.preferredServices}
                            </div>
                          )}
                          {user.lastVisit && (
                            <div>
                              <span className="font-medium">Last Visit:</span> {new Date(user.lastVisit).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="queue" className="space-y-4">
              <h3 className="text-lg font-semibold">Mock Customer Queue</h3>
              <div className="grid gap-4">
                {mockCustomersQueue.map((customer) => (
                  <Card key={customer.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.contact}</p>
                      </div>
                      <div className="text-right text-sm">
                        <Badge variant={customer.inStore ? 'default' : 'secondary'}>
                          {customer.inStore ? 'In-Store' : 'Online'}
                        </Badge>
                        <p className="text-muted-foreground mt-1">
                          Wait: {customer.estimatedWaitTime} min
                        </p>
                        <p className="text-muted-foreground">
                          Service: {customer.requestedService}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="booking" className="space-y-4">
              <h3 className="text-lg font-semibold">Booking System Features</h3>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Available Services</h4>
                <div className="grid gap-2">
                  {services.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{service.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({service.duration} min)
                        </span>
                      </div>
                      <span className="font-medium">${service.price}</span>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground mt-2">
                    ...and {services.length - 5} more services available
                  </p>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Sample Bookings</h4>
                <div className="grid gap-2">
                  {mockBookings.map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{booking.customerName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {booking.time} - {booking.services.map(s => s.name).join(', ')}
                        </span>
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Testing Scenarios</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Visit <code>/book</code> to test the booking system</li>
                  <li>Try both "Schedule Appointment" and "Walk-in Check-in" tabs</li>
                  <li>Select multiple services to see pricing calculations</li>
                  <li>Test date/time selection for appointments</li>
                  <li>Submit bookings to see confirmation flow</li>
                  <li>Login as admin to view booking management in dashboard</li>
                  <li>Test booking status changes and editing in admin panel</li>
                </ol>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <h3 className="text-lg font-semibold">Dynamic Color System</h3>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5" />
                  <h4 className="font-medium">Color Theme Demo</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Test the dynamic color system that allows users to change the entire application's color scheme instantly.
                </p>
                <Link to="/colors">
                  <Button className="w-full" style={{backgroundColor: '#d34000'}}>
                    <Palette className="h-4 w-4 mr-2" />
                    Open Color Demo Page
                  </Button>
                </Link>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Available Color Themes</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <div className="w-4 h-4 rounded-full bg-rose-500"></div>
                    <span className="font-medium">Rose Stone</span>
                    <span className="text-sm text-muted-foreground">(Default)</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <div className="w-4 h-4 rounded-full bg-sky-500"></div>
                    <span className="font-medium">Ocean Blue</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                    <span className="font-medium">Forest Green</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span className="font-medium">Sunset Orange</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="font-medium">Purple Luxury</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#d4a574' }}></div>
                    <span className="font-medium">Warm Beige</span>
                    <span className="text-sm text-muted-foreground">(New!)</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">How to Use Dynamic Colors</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Look for the 🎨 Colors button in the top-right corner of any page</li>
                  <li>Click it to open the theme selector</li>
                  <li>Choose any theme to see instant color changes</li>
                  <li>Your preference is automatically saved</li>
                  <li>Visit <code>/colors</code> for a comprehensive demo</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">For Developers</h4>
                <div className="space-y-2 text-sm">
                  <p>Use these CSS classes for dynamic colors:</p>
                  <div className="grid gap-1 font-mono text-xs bg-muted p-2 rounded">
                    <div><code>bg-dynamic-primary</code> - Primary background</div>
                    <div><code>text-dynamic-primary</code> - Primary text</div>
                    <div><code>bg-dynamic-surface</code> - Surface background</div>
                    <div><code>text-dynamic-text</code> - Main text</div>
                    <div><code>border-dynamic-border</code> - Borders</div>
                    <div><code>hover:bg-dynamic-primary-hover</code> - Hover states</div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="setup" className="space-y-4">
              <h3 className="text-lg font-semibold">Setup Instructions</h3>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Testing with Mock Data (Current Mode)</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Use any of the test accounts from the "Test Accounts" tab</li>
                  <li>Login with the provided email and password</li>
                  <li>Test different user roles (Customer, Admin, Employee)</li>
                  <li>Admin users will see the "Admin Dashboard" button</li>
                  <li>Check-in functionality will work with simulated responses</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Switching to Real Backend</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Open your <code>.env.local</code> file</li>
                  <li>Change <code>VITE_USE_MOCK_API=true</code> to <code>VITE_USE_MOCK_API=false</code></li>
                  <li>Ensure your backend is running on the configured port (default: 8080)</li>
                  <li>Restart the development server</li>
                  <li>Use real user accounts from your backend database</li>
                </ol>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Environment Variables</h4>
                <div className="space-y-2 text-sm">
                  <div><code>VITE_USE_MOCK_API</code> - Toggle mock API (true/false)</div>
                  <div><code>VITE_API_BASE</code> - Backend API URL</div>
                  <div><code>VITE_BASE_PATH</code> - Application base path</div>
                </div>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> You can quickly test admin functionality by logging in with 
                  <code className="mx-1">admin@salonhub.com</code> and password <code>admin123</code>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingGuide;
