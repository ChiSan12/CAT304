import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Home as HomeIcon } from 'lucide-react'; 

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PetBrowsePage from './pages/PetBrowsePage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/MyDashboard';
import ReportPage from './pages/ReportPage';
import ShelterDashboard from './pages/ShelterDashboard';

// Components
import ChatBot from './components/ChatBot';

import './styles/HomePage.css';
import './styles/PetStyles.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { user, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Protected navigation
  const goTo = (page) => {
    if (
      (page === 'profile' || page === 'dashboard' || page === 'report') &&
      !user
    ) {
      alert('Please login first.');
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  };

  const isActive = (page) =>
    currentPage === page
      ? 'text-orange-500 font-semibold'
      : 'text-gray-600';

  return (
    <div className="min-h-screen flex flex-col">

      {/* ================= NAV BAR ================= */}
      <header className="header-nav">
        <div
          className="logo"
          style={{ cursor: 'pointer' }}
          onClick={() => setCurrentPage('home')}
        >
          🐾 PET Found Us
        </div>

        <nav>
          {/* Home button (Everyone) */}
          <button
            className={`nav-button ${isActive('home')}`}
            onClick={() => setCurrentPage('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <HomeIcon size={18} />
            Home
          </button>

          {/* Browse & Report (Available to Everyone or just Users) */}
          <button
            className={`nav-button ${isActive('browse')}`}
            onClick={() => goTo('browse')}
          >
            Browse Pets
          </button>

          <button
            className={`nav-button ${isActive('report')}`}
            onClick={() => goTo('report')}
          >
            Report Strays
          </button>


          {/* === ROLE BASED BUTTONS === */}

          {/* 1. ADMIN ONLY BUTTON */}
          {user && user.role === 'shelter' && (
            <button
              className={`nav-button ${isActive('shelter-admin')}`}
              onClick={() => setCurrentPage('shelter-admin')}
              style={{ color: '#2563EB', fontWeight: 'bold' }}
            >
              Shelter Admin
            </button>
          )}

          {/* 2. USER ONLY BUTTON */}
          {user && user.role === 'adopter' && (
            <button
              className={`nav-button ${isActive('dashboard')}`}
              onClick={() => goTo('dashboard')}
            >
              My Dashboard
            </button>
          )}


          {/* === AUTH BUTTONS === */}
          {user ? (
            <>
              {/* Profile - User Only */}
              {user.role === 'adopter' && (
                <button
                  className={`nav-button ${isActive('profile')}`}
                  onClick={() => goTo('profile')}
                >
                  Profile
                </button>
              )}

              <button
                className="nav-button"
                style={{ color: '#ff4d4d', fontWeight: 'bold' }}
                onClick={() => {
                  logout();
                  setCurrentPage('home');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-button ${isActive('login')}`}
                onClick={() => setCurrentPage('login')}
              >
                Login
              </button>

              <button
                className={`nav-button ${isActive('register')}`}
                onClick={() => setCurrentPage('register')}
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </header>

      {/* ================= PAGE CONTENT ================= */}
      <main className="flex-grow">
        {currentPage === 'home' && <HomePage goTo={goTo} />}
        {currentPage === 'browse' && <PetBrowsePage />}
        {currentPage === 'report' && <ReportPage />}
        
        {/* Render User Dashboard */}
        {currentPage === 'dashboard' && <DashboardPage />}
        
        {/* Render Admin Dashboard */}
        {currentPage === 'shelter-admin' && <ShelterDashboard />}
        
        {currentPage === 'profile' && <ProfilePage />}

        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={() => {
              // Redirect Admin to Shelter Dashboard, User to Home
              // We can't check 'user' here immediately as state might not be updated yet
              // so we default to home, and they can click the button
              setCurrentPage('home');
            }}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        )}
      </main>

      {/* ================= CHATBOT ================= */}
      <ChatBot />
    </div>
  );
}

export default App;