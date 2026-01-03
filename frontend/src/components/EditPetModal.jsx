import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, Loader } from 'lucide-react';

export default function EditPetModal({ isOpen, onClose, onSave, pet }) {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: 'Male',
    ageYears: 0,
    ageMonths: 0,
    size: 'Medium',
    adoptionStatus: 'Available',
    description: '',
    imageUrl: '',
    temperament: [],
    goodWith: [],
    vaccinated: false,
    neutered: false,
    medicalConditions: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // 🆕 AI loading state

  // Pre-fill form when "pet" prop changes
  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || '',
        species: pet.species || 'Dog',
        breed: pet.breed || '',
        gender: pet.gender || 'Male',
        ageYears: pet.age?.years || 0,
        ageMonths: pet.age?.months || 0,
        size: pet.size || 'Medium',
        adoptionStatus: pet.adoptionStatus || 'Available',
        description: pet.description || '',
        imageUrl: pet.images?.[0]?.url || '',
        temperament: pet.labels?.temperament || [],
        goodWith: pet.labels?.goodWith || [],
        vaccinated: pet.healthStatus?.vaccinated || false,
        neutered: pet.healthStatus?.neutered || false,
        medicalConditions: pet.healthStatus?.medicalConditions?.join(', ') || ''
      });
    }
  }, [pet]);

  if (!isOpen || !pet) return null;

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

  //  AI-Powered Label Suggestion
  const getSuggestedLabels = async () => {
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
        setFormData(prev => ({
          ...prev,
          temperament: data.suggestions.temperament || [],
          goodWith: data.suggestions.goodWith || []
        }));
        
        alert('✨ AI suggestions applied! You can still adjust them manually.');
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
        adoptionStatus: formData.adoptionStatus,
        description: formData.description,
        images: [{ url: formData.imageUrl }],
        labels: {
          temperament: formData.temperament,
          goodWith: formData.goodWith
        },
        healthStatus: {
          vaccinated: formData.vaccinated,
          neutered: formData.neutered,
            medicalConditions: formData.medicalConditions
            ? formData.medicalConditions
                .split(',')
                .map(c => c.trim())
                .filter(Boolean)
            : []
        }
      };

      const res = await fetch(`http://localhost:5000/api/shelters/pets/${pet._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        onSave();
        onClose();
      } else {
        alert("Update failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const temperamentOptions = ['Calm', 'Playful', 'Energetic', 'Friendly', 'Independent'];
  const goodWithOptions = ['Children', 'Other Dogs', 'Other Cats', 'Elderly', 'Single Adults'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Edit {pet.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Status Dropdown */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label className="block text-sm font-bold text-blue-800 mb-2">Adoption Status</label>
            <select 
              name="adoptionStatus" 
              value={formData.adoptionStatus} 
              onChange={handleChange} 
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Adopted">Adopted</option>
            </select>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" 
                required 
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
              />
            </div>
          </div>

          {/* Details Row */}
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

          {/* Age Section */}
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
              placeholder="Describe the pet's personality, behavior, energy level..."
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: Detailed descriptions help AI suggest accurate labels
            </p>
          </div>

          {/* Temperament */}
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

          {/* Good With */}
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

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Medical Conditions (optional)
            </label>
            <textarea
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
              placeholder="e.g. Skin allergy, Heart condition"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none"
            />
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
                  <span className="text-gray-400 text-xs">No image</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}