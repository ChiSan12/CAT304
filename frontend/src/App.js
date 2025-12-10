import React, { useState } from 'react';
import { useAuth } from './context/AuthContext'; // Import Auth Hook for state management

// --- Import All Page Components ---
import RegisterPage from './pages/RegisterPage'; // Used for Sign Up functionality
import PetBrowsePage from './pages/PetBrowsePage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// --- Import Styles and Components ---
import './styles/HomePage.css';
import ChatBot from './components/ChatBot';

function App() {
  // Current page state controls which component is displayed
  const [currentPage, setCurrentPage] = useState('home');
  
  // Get user state and logout function from Auth Context
  const { user, logout } = useAuth();

  // --- Navigation Click Handler ---
  const handleNavClick = (page) => {
    // 🔒 Protected Route Logic: Check if the user is trying to access 'profile' without being logged in
    if (page === 'profile' && !user) {
      const confirmLogin = window.confirm("You must be logged in to view your profile. Would you like to sign in now?");
      if (confirmLogin) {
        setCurrentPage('login'); // Redirect to Login page
      }
      return; // Stop navigation attempt
    }
    
    // Normal navigation
    setCurrentPage(page);
  };

  // --- Helper function for styling the active navigation link ---
  const getNavClass = (page) => 
    currentPage === page ? 'active-link' : '';

  return (
    <div>
      {/* ================= NAVIGATION BAR ================= */}
      <header className="header-nav"> 
        {/* Logo: Click to return Home */}
        <div 
          className="logo" 
          onClick={() => setCurrentPage('home')} 
          style={{cursor:'pointer'}}
        >
          🐾 PET Found Us
        </div> 
        
        <nav>
          {/* --- 1. Public Routes (Always Visible) --- */}
          <button 
            onClick={() => handleNavClick('home')}
            className={`nav-button ${getNavClass('home')}`}
          >
            Home
          </button>
          
          <button 
            onClick={() => handleNavClick('browse')}
            className={`nav-button ${getNavClass('browse')}`}
          >
            Adopt
          </button>

          <button 
            className="nav-button"
            onClick={() => alert('Report page coming soon!')}
          >
            Report
          </button>
           
          {/* --- 2. Authentication Conditional Rendering --- */}
          {user ? (
            // ✅ Logged In State: Show Profile, Dashboard, and Logout
            <>
              <button 
                onClick={() => handleNavClick('profile')}
                className={`nav-button ${getNavClass('profile')}`}
              >
                My Profile
              </button>

              <button 
                className="nav-button"
                onClick={() => alert('My dashboard coming soon!')}
              >
                Dashboard
              </button>

              {/* Logout Button */}
              <button 
                className="nav-button"
                style={{color: '#ff4d4d', fontWeight: 'bold'}}
                onClick={() => {
                  logout(); // Clear user session
                  setCurrentPage('home'); // Redirect to home page
                  alert("You have been safely logged out.");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            // ❌ Logged Out State: Show Sign Up and Sign In
            <>
              {/* Sign Up (Maps to RegisterPage component) */}
              <button 
                onClick={() => handleNavClick('register')}
                className={`nav-button ${getNavClass('register')}`}
              >
                Sign Up
              </button>

              {/* Sign In */}
              <button 
                onClick={() => setCurrentPage('login')}
                className={`nav-button ${getNavClass('login')}`}
              >
                Sign In
              </button>
            </>
          )}

          {/* --- 3. Additional Public Button --- */}
          <button 
            className="nav-button"
            onClick={() => alert('Contact page coming soon!')}
          >
            Contact
          </button>

        </nav>
      </header>

      {/* ================= PAGE CONTENT AREA ================= */}
      <main>
        {currentPage === 'home' && <HomePage />}
        
        {currentPage === 'browse' && <PetBrowsePage />}
        
        {/* RegisterPage (Sign Up) receives a callback to redirect to Login on success */}
        {currentPage === 'register' && (
          <RegisterPage
          // onSwitchToLogin is used in RegisterPage's handleSubmit after successful registration
          onSwitchToLogin={() => setCurrentPage('login')} 
          />
        )} 
        
        {currentPage === 'profile' && <ProfilePage />}
        
        {/* LoginPage receives two callbacks for navigation: success and switch-to-register */}
        {currentPage === 'login' && (
          <LoginPage 
            onLoginSuccess={() => setCurrentPage('home')} 
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        )}
      </main>

      {/* ================= FLOATING CHATBOT ================= */}
      <ChatBot />

    </div>
  );
}

export default App;