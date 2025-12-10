import React from 'react';
import RegisterPage from './pages/RegisterPage';
import PetBrowsePage from './pages/PetBrowsePage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [currentPage, setCurrentPage] = React.useState('browse');

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="bg-indigo-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">PET Found Us</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setCurrentPage('register')}
              className="hover:underline"
            >
              Register
            </button>
            <button 
              onClick={() => setCurrentPage('browse')}
              className="hover:underline"
            >
              Browse Pets
            </button>
            <button 
              onClick={() => setCurrentPage('profile')}
              className="hover:underline"
            >
              My Profile
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'register' && <RegisterPage />}
      {currentPage === 'browse' && <PetBrowsePage />}
      {currentPage === 'profile' && <ProfilePage />}
    </div>
  );
}

export default App;