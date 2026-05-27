import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
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

function App() {
  return (
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
  );
}

export default App;
