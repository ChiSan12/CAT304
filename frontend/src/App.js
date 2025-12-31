import { useAuth } from "./context/AuthContext";
import { Home as HomeIcon } from "lucide-react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import PetBrowsePage from "./pages/PetBrowsePage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/MyDashboard";
import ReportPage from "./pages/ReportPage";
import ShelterDashboard from "./pages/ShelterDashboard";
import ShelterLoginPage from "./pages/ShelterLoginPage";
import ShelterPetsPage from "./pages/ShelterPetsPage";
import ShelterRequestPage from "./pages/ShelterRequestPage";
import ShelterStrayReportPage from "./pages/ShelterStrayReportPage";

// Components
import ChatBot from "./components/ChatBot";

import "./styles/HomePage.css";
import "./styles/PetStyles.css";
import ShelterSettingPage from "./pages/ShelterSettingPage";

function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* ================= NAV BAR ================= */}
      <header className="header-nav">
        <NavLink
          className="logo cursor-pointer"
          to={user && user.role === "shelter" ? "/admin/overview" : "/"}
        >
          🐾 PET Found Us
        </NavLink>

        {(!user || user.role !== "shelter") && (
          <nav>
            {/* Home button (Everyone) */}
            <NavLink className="nav-button flex items-center gap-1.5" to="/">
              <HomeIcon size={18} />
              Home
            </NavLink>

            {/* Browse & Report (Available to Everyone or just Users) */}
            <NavLink className="nav-button" to="/browse">
              Browse Pets
            </NavLink>

            {/* === ROLE BASED BUTTONS === */}
            <NavLink className="nav-button" to="/report">
              Report Strays
            </NavLink>

            {/* 2. USER ONLY BUTTON */}
            {user && user.role === "adopter" && (
              <NavLink className="nav-button" to="/dashboard">
                My Dashboard
              </NavLink>
            )}

            {/* === AUTH BUTTONS === */}
            {user ? (
              <>
                {/* Profile - User Only */}
                {user.role === "adopter" && (
                  <NavLink className="nav-button" to="/profile">
                    Profile
                  </NavLink>
                )}

                <button
                  className="nav-button text-[#ff4d4d] font-bold"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink className="nav-button" to="/login">
                  Login
                </NavLink>

                <NavLink className="nav-button" to="/register">
                  Sign Up
                </NavLink>
              </>
            )}
          </nav>
        )}
      </header>

      {/* ================= PAGE CONTENT ================= */}
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<PetBrowsePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/overview" element={<ShelterDashboard />} />
          <Route path="/admin/manage-pets" element={<ShelterPetsPage />} />
          <Route path="/admin/requests" element={<ShelterRequestPage />} />
          <Route
            path="/admin/stray-reports"
            element={<ShelterStrayReportPage />}
          />
          <Route path="/admin/settings" element={<ShelterSettingPage />} />
          <Route path="/admin/login" element={<ShelterLoginPage />} />
        </Routes>
      </main>

      {/* ================= CHATBOT ================= */}
      <ChatBot />
    </div>
  );
}

export default App;
