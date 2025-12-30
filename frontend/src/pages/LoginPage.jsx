import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Heart, AlertCircle } from 'lucide-react';


const LoginPage = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Handle login form submission
  const handleSubmit = async (e) => { 
    e.preventDefault();
    setError('');
    
    // Basic client-side validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    // Send login request to backend
    try {
      const response = await fetch('http://localhost:5000/api/adopters/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Save user data to global auth context
        const userData = { ...data.adopter, id: data.adopterId };
        login(userData); 
        onLoginSuccess(); 
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left section: visual and branding area */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#FF8C42] to-[#FFA726] p-12 text-white relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10 text-center">
            <div className="mb-8">
              <Heart className="w-24 h-24 mx-auto mb-4 animate-pulse" />
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              Welcome Back!
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Continue your journey to find your perfect companion
            </p>
            
            {/* Feature highlights */}
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

        {/* Right section: login form */}
        <div className="p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Logo for mobile */}
            <div className="lg:hidden text-center mb-8">
              <Heart className="w-16 h-16 mx-auto text-[#FF8C42] mb-4" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sign In
            </h1>
            <p className="text-gray-600 mb-8">
              Enter your credentials to access your account
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <button 
                  type="button"
                  className="text-sm text-[#FF8C42] hover:text-[#e67e3b] font-medium"
                >
                  Forgot password?
                </button>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF8C42] to-[#FFA726] hover:from-[#e67e3b] hover:to-[#f59e0b] text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={onSwitchToRegister}
                  className="text-[#FF8C42] hover:text-[#e67e3b] font-semibold hover:underline"
                >
                  Create one now
                </button>
              </p>
            </div>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;