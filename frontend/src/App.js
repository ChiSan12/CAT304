import React from 'react';
import RegisterPage from './pages/RegisterPage';
import PetBrowsePage from './pages/PetBrowsePage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import './styles/HomePage.css'; // Import global styles

function App() {
  const [currentPage, setCurrentPage] = React.useState('home');

  // Helper function to determine the active class for styling
  const getNavClass = (page) => 
    currentPage === page ? 'active-link' : '';

  return (
    <div>
      {/* NAVIGATION BAR */}
      <header className="header-nav"> 
        <div className="logo">🐾 PET Found Us</div> 
        <nav>
          {/* HOME */}
          <button 
            onClick={() => setCurrentPage('home')}
            className={`nav-button ${getNavClass('home')}`}
          >
            Home
          </button>
          
          {/* ADOPT */}
          <button 
            onClick={() => setCurrentPage('browse')}
            className={`nav-button ${getNavClass('browse')}`}
          >
            Adopt
          </button>

           {/* REPORT */}
          <button 
            className="nav-button"
            onClick={() => alert('Report page coming soon!')}
          >
            Report
          </button>

           
          {/* Register*/}
          <button 
            onClick={() => setCurrentPage('register')}
            className={`nav-button ${getNavClass('register')}`}
          >
            Register Pet
          </button>

          {/* MY Profile */}
          <button 
            onClick={() => setCurrentPage('profile')}
            className={`nav-button ${getNavClass('profile')}`}
          >
            My Profile
          </button>

          
          {/* My Dashboard */}
          <button 
            className="nav-button"
            onClick={() => alert('My dashboard coming soon!')}
          >
            Dashboard
          </button>
          
          {/* CONTACT */}
          <button 
            className="nav-button"
            onClick={() => alert('Contact page coming soon!')}
          >
            Contact
          </button>
        </nav>
      </header>

      {/* PAGE CONTENT */}
      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'browse' && <PetBrowsePage />}
        {currentPage === 'register' && <RegisterPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
}

export default App;