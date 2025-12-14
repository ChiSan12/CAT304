import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PetBrowsePage from './pages/PetBrowsePage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/MyDashboard';
import ReportPage from './pages/ReportPage';

// Components & Styles
import './styles/HomePage.css';
import ChatBot from './components/ChatBot';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { user, logout } = useAuth();

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

  // Active link styling
  const isActive = (page) =>
    currentPage === page ? 'active-link' : '';

  return (
    <div>
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
            Report
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
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'browse' && <PetBrowsePage />}
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