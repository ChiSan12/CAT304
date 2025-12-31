import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Lock,
  Phone,
  UserCircle,
  Heart,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setMessage({ type: "", text: "" });
    if (!validateForm()) return;

    setLoading(true);

    // Process phone number: remove all non-digit characters
    let finalPhone = "";
    if (formData.phone.trim()) {
      const rawPhone = formData.phone.replace(/\D/g, ""); // Remove all non-digit characters

      // If the user enters a local number starting with 0, remove the leading 0
      const normalizedPhone = rawPhone.startsWith("0")
        ? rawPhone.slice(1)
        : rawPhone;

      if (!/^1\d{8}$/.test(normalizedPhone)) {
        setErrors((prev) => ({
          ...prev,
          phone: "Invalid Malaysian mobile number",
        }));
        setLoading(false);
        return;
      }

      finalPhone = `+60${normalizedPhone}`;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/adopters/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: finalPhone,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Registration successful! Redirecting to login...",
        });

        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          fullName: "",
          phone: "",
        });

        navigate("/login");
      } else {
        setMessage({
          type: "error",
          text: data.message || "Registration failed",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left visual section */}
        <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#FF8C42] to-[#FFA726] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10 text-center">
            <Heart className="w-24 h-24 mx-auto mb-8 animate-pulse" />

            <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Start your journey to find your perfect furry friend
            </p>

            <div className="space-y-4 text-left bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  1
                </div>
                <span>Create your free account</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  2
                </div>
                <span>Set your preferences</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  3
                </div>
                <span>Get matched with pets</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  4
                </div>
                <span>Start your adoption journey</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form section */}
        <div className="p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 mb-6">
              Join PET Found Us to adopt your new friend
            </p>

            {message.text && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p>{message.text}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent focus:outline-none focus:ring-offset-0 ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your username"
                  />
                </div>

                {errors.username && (
                  <p className="text-xs text-red-600 mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent focus:outline-none focus:ring-offset-0 ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>

                {errors.fullname && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent focus:outline-none focus:ring-offset-0 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>

                <div className="flex items-center w-full border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#FF8C42] focus-within:border-transparent">
                  <Phone className="w-5 h-5 text-gray-400 ml-3 mr-2" />

                  <div className="px-3 py-2.5 text-gray-700 text-sm font-medium border-r border-gray-300">
                    +60
                  </div>

                  {/* Local phone number */}
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-0 pl-3 pr-4 py-2.5 focus:outline-none focus:ring-0 focus:border-0"
                    placeholder="123456789"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent focus:outline-none focus:ring-offset-0 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Create a password"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent focus:outline-none focus:ring-offset-0 ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Re-enter password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="w-full bg-gradient-to-r from-[#FF8C42] to-[#FFA726] hover:from-[#e67e3b] hover:to-[#f59e0b] text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>

            <p className="text-center text-gray-600 mt-6">
              Already have an account?
              <NavLink
                to="/login"
                className="text-[#FF8C42] hover:text-[#e67e3b] font-semibold hover:underline ml-1"
              >
                Log in here
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
