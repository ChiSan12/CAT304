import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Heart, Shield, AlertCircle } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(true); // Toggle for Shelter/Adopter login
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Keep: Client-side form validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      // Choose correct endpoint based on toggle
      const endpoint = isAdmin
        ? "http://localhost:5000/api/shelters/login"
        : "http://localhost:5000/api/adopters/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Standardize user data with role for AuthContext
        let userData;
        if (isAdmin) {
          userData = { ...data.shelter, role: "shelter" };
        } else {
          userData = { ...data.adopter, id: data.adopterId, role: "adopter" };
        }

        login(userData);

        navigate("/admin/overview");
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "shelter") navigate("/admin/overview");
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left side: Visual branding (changes color based on toggle) */}
        <div
          className={`hidden lg:flex flex-col justify-center items-center p-12 text-white relative overflow-hidden ${
            isAdmin
              ? "bg-gradient-to-br from-blue-600 to-blue-400"
              : "bg-gradient-to-br from-[#FF8C42] to-[#FFA726]"
          }`}
        >
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 text-center">
            <div className="mb-8">
              {isAdmin ? (
                <Shield className="w-24 h-24 mx-auto mb-4 animate-pulse" />
              ) : (
                <Heart className="w-24 h-24 mx-auto mb-4 animate-pulse" />
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">
              {isAdmin ? "Shelter Management" : "Welcome Back!"}
            </h1>
            <p className="text-white/90 text-lg mb-8">
              {isAdmin
                ? "Manage your shelter and help pets find homes"
                : "Continue your journey to find your perfect companion"}
            </p>

            {/* Feature highlights list */}
            <div className="space-y-4 text-left bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              {isAdmin ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-white/90">Manage pet listings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-white/90">
                      Review adoption requests
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-white/90">
                      Update shelter profile
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-white/90">Browse loving pets</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-white/90">Get smart pet matches</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-white/90">
                      Track your adoption journey
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Login form */}
        <div className="p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Logo for mobile view */}
            <div className="lg:hidden text-center mb-8">
              {isAdmin ? (
                <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              ) : (
                <Heart className="w-16 h-16 mx-auto text-[#FF8C42] mb-4" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isAdmin ? "Shelter Admin" : "Sign In"}
            </h1>
            <p className="text-gray-600 mb-8">
              {isAdmin
                ? "Access your shelter dashboard"
                : "Enter your credentials to access your account"}
            </p>

            {/* Error alert message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
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

              {/* Password */}
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

              {/* Submit button (changes color based on user type) */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  isAdmin
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                    : "bg-gradient-to-r from-[#FF8C42] to-[#FFA726] hover:from-[#e67e3b] hover:to-[#f59e0b] text-white"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    {isAdmin ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <Heart className="w-5 h-5" />
                    )}
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Register link (only shown for adopters) */}
            {!isAdmin && (
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <NavLink
                    to="/register"
                    className="text-[#FF8C42] hover:text-[#e67e3b] font-semibold hover:underline"
                  >
                    Create one now
                  </NavLink>
                </p>
              </div>
            )}

            {/* Terms and Privacy notice */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
