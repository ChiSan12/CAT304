import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function EditPetModal({ isOpen, onClose, onSave, pet }) {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: 'Male',
    ageYears: 0,   // Added
    ageMonths: 0,  // Added
    size: 'Medium', // Added
    adoptionStatus: 'Available',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill form when "pet" prop changes
  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || '',
        species: pet.species || 'Dog',
        breed: pet.breed || '',
        gender: pet.gender || 'Male',
        // Extract nested age values
        ageYears: pet.age?.years || 0,
        ageMonths: pet.age?.months || 0,
        size: pet.size || 'Medium',
        adoptionStatus: pet.adoptionStatus || 'Available',
        description: pet.description || '',
        imageUrl: pet.images?.[0]?.url || ''
      });
    }
  }, [pet]);

  if (!isOpen || !pet) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Reconstruct the payload to match backend schema
      const payload = {
        ...formData,
        age: {
          years: parseInt(formData.ageYears),
          months: parseInt(formData.ageMonths)
        },
        images: [{ url: formData.imageUrl }]
      };

      const res = await fetch(`http://localhost:5000/api/shelters/pets/${pet._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        onSave(); // Refresh parent list
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
              <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
            </div>
          </div>

          {/* Details Row: Species, Gender, Size */}
          <div className="grid grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Species</label>
              <select name="species" value={formData.species} onChange={handleChange} className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white">
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
              <select name="size" value={formData.size} onChange={handleChange} className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-white">
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
          </div>

          {/* Age Section - THIS WAS MISSING */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Years)</label>
              <input 
                type="number" 
                name="ageYears" 
                min="0" 
                value={formData.ageYears} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Months)</label>
              <input 
                type="number" 
                name="ageMonths" 
                min="0" max="11"
                value={formData.ageMonths} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200"></textarea>
          </div>

          {/* Image URL */}
          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
             <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg">
              {loading ? 'Saving...' : <><Save size={20} className="inline mr-2"/> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}