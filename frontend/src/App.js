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

// Components
import ChatBot from './components/ChatBot';

import './styles/HomePage.css';
import './styles/PetStyles.css';


function App() {
  // Initialize with saved page or default to 'home'
  const [currentPage, setCurrentPage] = useState(() => {
    return sessionStorage.getItem('currentPage') || 'home';
  });
  const { user, logout } = useAuth();
  
  // Track if this is initial mount
  const isInitialMount = React.useRef(true);

  // Load saved page on mount (for refresh)
  useEffect(() => {
    const savedPage = sessionStorage.getItem('currentPage');
    if (savedPage) {
      setCurrentPage(savedPage);
    }
  }, []);

  // Scroll to top on initial mount/refresh
  useEffect(() => {
    // Only scroll on initial mount, and only if not browse page
    if (currentPage !== 'browse') {
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency - only runs once on mount

  // Save current page when it changes
  useEffect(() => {
    sessionStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Handle scroll for page navigation (not initial mount)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Scroll to top when navigating between pages
    if (currentPage !== 'browse') {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
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
          {/* Home button */}
          <button
            className={`nav-button ${isActive('home')}`}
            onClick={() => setCurrentPage('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <HomeIcon size={18} />
            Home
          </button>

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

          {user && (
            <button
              className={`nav-button ${isActive('dashboard')}`}
              onClick={() => goTo('dashboard')}
            >
              Dashboard
            </button>
          )}

          {user ? (
            <>
              <button
                className={`nav-button ${isActive('profile')}`}
                onClick={() => goTo('profile')}
              >
                Profile
              </button>

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
        {currentPage === 'browse' && (
          <PetBrowsePage onNavigateToLogin={() => setCurrentPage('login')} />
        )}
        {currentPage === 'report' && <ReportPage />}
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'profile' && <ProfilePage />}

        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={() => setCurrentPage('home')}
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