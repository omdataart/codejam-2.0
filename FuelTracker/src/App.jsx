// src/App.js
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import History from "./pages/History";
import FillUpForm from "./pages/FillUpForm";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import StatsBrandGrade from "./pages/StatsBrandGrade";
import Privacy from "./pages/Privacy";
import { useAuthStore } from "./store/authStore";

function Private({ children }) {
  const user = useAuthStore((s) => s.user);
  return user ? children : <Navigate to="/auth/login" replace />;
}

export default function App() {
 

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Protected routes */}
        <Route
          path="/app/*"
          element={
            <Private>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="history" element={<History />} />
                <Route path="fillups/new" element={<FillUpForm />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="stats/brand-grade" element={<StatsBrandGrade />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Private>
          }
        />

        {/* Catch-all for invalid routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
