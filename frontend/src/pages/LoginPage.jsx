import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Heart, ShieldCheck, AlertCircle } from 'lucide-react';

const LoginPage = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Toggle for Admin/User
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Choose the correct endpoint based on the toggle
      const endpoint = isAdmin 
        ? 'http://localhost:5000/api/shelters/login' 
        : 'http://localhost:5000/api/adopters/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 2. Standardize user data for the AuthContext
        let userData;
        
        if (isAdmin) {
          // Shelter Data
          userData = { ...data.shelter, role: 'shelter' };
        } else {
          // Adopter Data
          userData = { ...data.adopter, id: data.adopterId, role: 'adopter' };
        }

        login(userData); 
        onLoginSuccess(); 
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      
      {/* --- LEFT SIDE: WELCOME VISUALS (Moved here so it appears on the Left) --- */}
      <div className={`hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden ${isAdmin ? 'bg-blue-600' : 'bg-orange-500'}`}>
        <div className="relative z-10 text-center text-white p-12">
            <div className="mb-8">
              <Heart className="w-24 h-24 mx-auto mb-4 animate-pulse" />
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Welcome Back!
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Continue your journey to find your perfect companion
            </p>
            
            <div className="space-y-4 text-left bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">🐾</span>
                </div>
                <span className="text-white/90">Browse available pets</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <span className="text-white/90">Get Smart Pet Matches</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">💝</span>
                </div>
                <span className="text-white/90">Track your adoption journey</span>
              </div>
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM (Moved here so it appears on the Right) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            {isAdmin ? (
              <ShieldCheck className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            ) : (
              <Heart className="w-16 h-16 mx-auto text-orange-500 mb-4" />
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? 'Shelter Admin' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isAdmin ? 'Manage your pets and requests' : 'Find your perfect companion'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 ${
                isAdmin 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' 
                  : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'
              }`}
            >
              {loading ? 'Logging in...' : (isAdmin ? 'Login to Dashboard' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button 
              type="button"
              onClick={() => setIsAdmin(!isAdmin)}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              {isAdmin ? 'Are you an Adopter? Login here' : 'Manage a Shelter? Admin Login'}
            </button>
          </div>
          
          {!isAdmin && (
            <div className="mt-4 text-center">
               <span className="text-gray-600 text-sm">Don't have an account? </span>
               <button onClick={onSwitchToRegister} className="text-orange-500 font-bold text-sm hover:underline">Register</button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default LoginPage;