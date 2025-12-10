import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Home, Dog, Save, CheckCircle } from 'lucide-react';

/**
 * Adopter Profile Management Component
 * Allows adopters to update their profile and set adoption preferences
 */
export default function ProfilePage() {
  const [adopterId] = useState('674f5a3b8c9d1e2f3a4b5c6d'); // Mock ID
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: ''
    }
  });

  const [preferences, setPreferences] = useState({
    preferredSize: [],
    preferredAge: [],
    preferredTemperament: [],
    hasGarden: false,
    hasOtherPets: false,
    hasChildren: false,
    experienceLevel: 'First-time'
  });

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch adopter profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/adopters/${adopterId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile({
          fullName: data.adopter.fullName || '',
          email: data.adopter.email || '',
          phone: data.adopter.phone || '',
          address: data.adopter.address || {
            street: '',
            city: '',
            state: '',
            postalCode: ''
          }
        });
        setPreferences(data.adopter.preferences || preferences);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`http://localhost:5000/api/adopters/${adopterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName,
          phone: profile.phone,
          address: profile.address,
          preferences: preferences
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully! ✅' 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Update failed' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle array preference
  const toggleArrayPreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and adoption preferences</p>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <CheckCircle className={`w-5 h-5 ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`} />
            <p className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+60 12-345 6789"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Address</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={profile.address.street}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profile.address.city}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={profile.address.state}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={profile.address.postalCode}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    address: { ...prev.address, postalCode: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Adoption Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <Dog className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Adoption Preferences</h2>
          </div>

          {/* Preferred Size */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Pet Size
            </label>
            <div className="flex flex-wrap gap-3">
              {['Small', 'Medium', 'Large'].map(size => (
                <button
                  key={size}
                  onClick={() => toggleArrayPreference('preferredSize', size)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    preferences.preferredSize.includes(size)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Temperament */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Temperament
            </label>
            <div className="flex flex-wrap gap-3">
              {['Calm', 'Playful', 'Energetic', 'Friendly', 'Independent'].map(temp => (
                <button
                  key={temp}
                  onClick={() => toggleArrayPreference('preferredTemperament', temp)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    preferences.preferredTemperament.includes(temp)
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400'
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          {/* Living Situation */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Living Situation
            </label>
            <div className="space-y-3">
              {[
                { key: 'hasGarden', label: 'I have a garden/yard' },
                { key: 'hasOtherPets', label: 'I have other pets' },
                { key: 'hasChildren', label: 'I have children at home' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[item.key]}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      [item.key]: e.target.checked
                    }))}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pet Ownership Experience
            </label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                experienceLevel: e.target.value
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="First-time">First-time owner</option>
              <option value="Some Experience">Some experience</option>
              <option value="Experienced">Experienced owner</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}