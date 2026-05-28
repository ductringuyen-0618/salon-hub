import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import HomePage from "./components/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import routes from "tempo-routes";

// Lazy load pages for better performance
const CheckInPage = lazy(() => import("./pages/CheckInPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const TestingGuide = lazy(() => import("./components/TestingGuide"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const ColorDemoPage = lazy(() => import("./pages/ColorDemoPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const WaitListPage = lazy(() => import("./pages/WaitListPage"));
const AdminSectionPlaceholder = lazy(() => import("./pages/AdminSectionPlaceholder"));
const AdminSettingsPage = lazy(() => import("./pages/AdminSettingsPage"));
const AdminServicesPage = lazy(() => import("./pages/AdminServicesPage"));

function App() {
  return (
    <SettingsProvider>
    <AuthProvider>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              Loading...
            </div>
          }
        >
          <>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/check-in" element={<CheckInPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/book" element={<Navigate to="/booking" replace />} />
              <Route path="/colors" element={<ColorDemoPage />} />
              <Route path="/waitlist" element={<WaitListPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin sub-routes — placeholders for tiles in AdminPage. */}
              <Route path="/admin/checkins" element={
                <ProtectedRoute requireAdmin={true}><Navigate to="/waitlist" replace /></ProtectedRoute>
              } />
              <Route path="/admin/staff" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSectionPlaceholder title="Staff Management" description="Add, edit, and manage your team of technicians, front-desk staff, and managers. Currently you can use the seed users and modify roles via the backend." />
                </ProtectedRoute>
              } />
              <Route path="/admin/services" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminServicesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute requireAdmin={true}><Navigate to="/admin" replace /></ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSectionPlaceholder title="Analytics & Reports" description="Revenue trends, busy-hour heatmaps, technician utilization, and customer retention." />
                </ProtectedRoute>
              } />
              <Route path="/admin/themes" element={
                <ProtectedRoute requireAdmin={true}><Navigate to="/colors" replace /></ProtectedRoute>
              } />
              <Route path="/admin/payments" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSectionPlaceholder title="Payments & Billing" description="Process payments, refunds, and view transaction history. Requires payment-processor integration (Stripe / Square)." />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              } />

              {/* Testing Route (only in development) */}
              <Route path="/testing" element={<TestingGuide />} />
              
              {/* Tempo routes (if enabled) */}
              {import.meta.env.VITE_TEMPO === "true" && (
                <Route path="/tempobook/*" />
              )}
              
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          </>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
