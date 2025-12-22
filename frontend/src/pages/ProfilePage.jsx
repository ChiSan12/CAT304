import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Dog, Save, CheckCircle, Home, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth(); 

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', postalCode: '' }
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

  useEffect(() => {
    const fetchProfile = async (id) => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/adopters/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setProfile({
            fullName: data.adopter.fullName || '',
            email: data.adopter.email || '',
            phone: data.adopter.phone || '',
            address: data.adopter.address || { street: '', city: '', state: '', postalCode: '' }
          });
          setPreferences(prev => data.adopter.preferences || prev); 
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchProfile(user.id);
    } else if (!user) {
      setLoading(false);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user || !user.id) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`http://localhost:5000/api/adopters/${user.id}`, {
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

        window.scrollTo({ top: 0, behavior: 'smooth' });
        
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
        <div className="w-12 h-12 border-4 border-[#FF8C42] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-[#FF8C42] to-[#FFA726] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-white/90 mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success/Error Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border-2 border-green-200' 
              : 'bg-red-50 border-2 border-red-200'
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
          <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <User className="w-6 h-6 text-[#FF8C42]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Personal Info</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42] transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 font-medium">{profile.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">📧 Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42] transition-all"
                    placeholder="+60 12-345 6789"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 rounded-xl">
                <MapPin className="w-6 h-6 text-[#FF8C42]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Address</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={profile.address.street}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42] transition-all"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profile.address.city}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42] transition-all"
                    placeholder="Penang"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={profile.address.state}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42] transition-all"
                    placeholder="Pulau Pinang"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={profile.address.postalCode}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    address: { ...prev.address, postalCode: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42] transition-all"
                  placeholder="10100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Adoption Preferences */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-8 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Dog className="w-6 h-6 text-[#FF8C42]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Adoption Preferences</h2>
          </div>

          {/* Preferred Size */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Preferred Pet Size
            </label>
            <div className="flex flex-wrap gap-3">
              {['Small', 'Medium', 'Large'].map(size => (
                <button
                  key={size}
                  onClick={() => toggleArrayPreference('preferredSize', size)}
                  className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                    preferences.preferredSize.includes(size)
                      ? 'bg-gradient-to-r from-[#FF8C42] to-[#FFA726] border-[#FF8C42] text-white shadow-lg'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-[#FF8C42]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Age */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Preferred Age
            </label>
            <div className="flex flex-wrap gap-3">
              {['Puppy', 'Young', 'Adult', 'Senior'].map(age => (
                <button
                  key={age}
                  onClick={() => toggleArrayPreference('preferredAge', age)}
                  className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                    preferences.preferredAge.includes(age)
                      ? 'bg-gradient-to-r from-[#FF8C42] to-[#FFA726] border-[#FF8C42] text-white shadow-lg'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-[#FF8C42]'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Temperament */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Preferred Temperament
            </label>
            <div className="flex flex-wrap gap-3">
              {['Calm', 'Playful', 'Energetic', 'Friendly', 'Independent'].map(temp => (
                <button
                  key={temp}
                  onClick={() => toggleArrayPreference('preferredTemperament', temp)}
                  className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                    preferences.preferredTemperament.includes(temp)
                      ? 'bg-gradient-to-r from-[#FF8C42] to-[#FFA726] border-[#FF8C42] text-white shadow-lg'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-[#FF8C42]'
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          {/* Living Situation */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Living Situation
            </label>
            <div className="space-y-3">
              {[
                { key: 'hasGarden', label: '🏡 I have a garden/yard' },
                { key: 'hasOtherPets', label: '🐾 I have other pets' },
                { key: 'hasChildren', label: '👶 I have children at home' }
              ].map(item => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-orange-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences[item.key]}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      [item.key]: e.target.checked
                    }))}
                    className="w-5 h-5 text-[#FF8C42] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#FF8C42]"
                  />
                  <span className="text-gray-700 font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Pet Ownership Experience
            </label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                experienceLevel: e.target.value
              }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF8C42] focus:border-[#FF8C42] transition-all font-medium"
            >
              <option value="First-time">First-time owner</option>
              <option value="Some Experience">Some experience</option>
              <option value="Experienced">Experienced owner</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#FF8C42] to-[#FFA726] hover:from-[#e67e3b] hover:to-[#f59e0b] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {saving ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Save Profile
              </>
            )}
          </button>
      </div>
        </div>
    </div>
  );
}