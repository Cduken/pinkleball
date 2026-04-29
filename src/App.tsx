import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts & landing sections
import MainLayout from "./layouts/MainLayout";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import CourtLocation from "./components/CourtLocation";
import Footer from "./components/Footer";

// Public pages
import Booking from "./pages/Booking";
import Availability from "./pages/Availability";
import Reservations from "./pages/Reservations";
import Tournaments from "./pages/Tournaments";

// Admin auth
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/login/LoginPage";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminReservations from "./pages/admin/Reservations";
import AdminParticipants from "./pages/admin/Participants";
import AdminTournaments from "./pages/admin/Tournaments";

const LandingPage = () => (
  <MainLayout>
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <CourtLocation />
    <Footer />
  </MainLayout>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/tournaments" element={<Tournaments />} />

          {/* ── Admin ── */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reservations"
            element={
              <ProtectedRoute>
                <AdminReservations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/participants"
            element={
              <ProtectedRoute>
                <AdminParticipants />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/tournaments"
            element={
              <ProtectedRoute>
                <AdminTournaments />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
