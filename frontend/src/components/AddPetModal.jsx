import React, { useState } from 'react';
import { X, Save, Upload, Sparkles, Loader } from 'lucide-react';

export default function AddPetModal({ isOpen, onClose, onSave, shelterId }) {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: 'Male',
    ageYears: 0,
    ageMonths: 0,
    size: 'Medium',
    description: '',
    imageUrl: '',
    temperament: [],
    goodWith: [],
    vaccinated: false,
    neutered: false
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // 🆕 AI suggestion loading state

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTemperamentToggle = (trait) => {
    setFormData(prev => ({
      ...prev,
      temperament: prev.temperament.includes(trait)
        ? prev.temperament.filter(t => t !== trait)
        : [...prev.temperament, trait]
    }));
  };

  const handleGoodWithToggle = (option) => {
    setFormData(prev => ({
      ...prev,
      goodWith: prev.goodWith.includes(option)
        ? prev.goodWith.filter(o => o !== option)
        : [...prev.goodWith, option]
    }));
  };

  // AI-Powered Label Suggestion Function
  const getSuggestedLabels = async () => {
    // Validation: Need description to analyze
    if (!formData.description || formData.description.trim().length < 20) {
      alert('Please write at least 20 characters in the description for AI to analyze');
      return;
    }

    setAiLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/suggest-labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: formData.description,
          species: formData.species,
          breed: formData.breed,
          name: formData.name
        })
      });

      const data = await response.json();

      if (data.success) {
        // Auto-fill the suggested labels
        setFormData(prev => ({
          ...prev,
          temperament: data.suggestions.temperament || [],
          goodWith: data.suggestions.goodWith || []
        }));
        
        alert(' AI suggestions applied! You can still adjust them manually.');
      } else {
        alert('AI suggestion failed: ' + data.message);
      }
    } catch (error) {
      console.error('AI Error:', error);
      alert('Network error during AI analysis');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender,
        size: formData.size,
        age: {
          years: parseInt(formData.ageYears) || 0,
          months: parseInt(formData.ageMonths) || 0
        },
        description: formData.description,
        images: [{ url: formData.imageUrl || 'https://via.placeholder.com/300' }],
        labels: { 
          temperament: formData.temperament, 
          goodWith: formData.goodWith 
        },
        healthStatus: {
          vaccinated: formData.vaccinated,
          neutered: formData.neutered
        }
      };

      const res = await fetch(`http://localhost:5000/api/shelters/${shelterId}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (data.success) {
        onSave(); 
        onClose(); 
        setFormData({
          name: '', species: 'Dog', breed: '', gender: 'Male',
          ageYears: 0, ageMonths: 0, size: 'Medium', description: '', imageUrl: '',
          temperament: [], goodWith: [], vaccinated: false, neutered: false
        });
      } else {
        alert('Error adding pet: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const temperamentOptions = ['Calm', 'Playful', 'Energetic', 'Friendly', 'Independent'];
  const goodWithOptions = ['Children', 'Other Dogs', 'Other Cats', 'Elderly', 'Single Adults'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Add New Pet Listing</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Row 1: Name & Breed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name *</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" 
                placeholder="e.g. Charlie" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
              <input 
                type="text" 
                name="breed" 
                value={formData.breed} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" 
                placeholder="e.g. Golden Retriever" 
              />
            </div>
          </div>

          {/* Row 2: Species, Gender, Size */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Species *</label>
              <select 
                name="species" 
                value={formData.species} 
                onChange={handleChange} 
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange} 
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size *</label>
              <select 
                name="size" 
                value={formData.size} 
                onChange={handleChange} 
                className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white"
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
          </div>

          {/* Row 3: Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Years)</label>
              <input 
                type="number" 
                name="ageYears" 
                min="0" 
                value={formData.ageYears} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Months)</label>
              <input 
                type="number" 
                name="ageMonths" 
                min="0" 
                max="11" 
                value={formData.ageMonths} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Description with AI Button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              {/* AI Suggestion Button */}
              <button
                type="button"
                onClick={getSuggestedLabels}
                disabled={aiLoading || !formData.description || formData.description.length < 20}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
              >
                {aiLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get AI Suggestions
                  </>
                )}
              </button>
            </div>
            <textarea 
              name="description" 
              rows="4" 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none resize-none" 
              placeholder="Describe the pet's personality, behavior, energy level, and how they interact with people and other animals... (At least 20 characters for AI suggestions)"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: The more detailed the description, the better the AI suggestions!
            </p>
          </div>

          {/* Temperament Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Temperament (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {temperamentOptions.map(trait => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => handleTemperamentToggle(trait)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.temperament.includes(trait)
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Good With Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Good With (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {goodWithOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleGoodWithToggle(option)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.goodWith.includes(option)
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Health Status */}
          <div className="bg-blue-50 rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Health Status</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="vaccinated"
                  checked={formData.vaccinated}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700 font-medium">Vaccinated</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="neutered"
                  checked={formData.neutered}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700 font-medium">Neutered/Spayed</span>
              </label>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" 
                placeholder="https://..." 
              />
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={24} className="text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (
                <>
                  <Save size={20} className="inline mr-2" />
                  Save Pet
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}