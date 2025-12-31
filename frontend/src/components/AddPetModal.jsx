import React, { useState } from 'react';
import { X, Save, Upload } from 'lucide-react';

export default function AddPetModal({ isOpen, onClose, onSave, shelterId }) {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: 'Male',
    ageYears: 0,
    ageMonths: 0, // State for months
    size: 'Medium',
    description: '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          months: parseInt(formData.ageMonths) || 0 // Send months to backend
        },
        description: formData.description,
        images: [{ url: formData.imageUrl || 'https://via.placeholder.com/300' }],
        labels: { temperament: [], goodWith: [] }
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
            ageYears: 0, ageMonths: 0, size: 'Medium', description: '', imageUrl: ''
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" placeholder="e.g. Charlie" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
              <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" placeholder="e.g. Golden Retriever" />
            </div>
          </div>

          {/* Row 2: Selectors (Species, Gender, Size) */}
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

          {/* Row 3: Age (Years & Months) - ADDED HERE */}
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Years)</label>
              <input type="number" name="ageYears" min="0" value={formData.ageYears} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Months)</label>
              <input type="number" name="ageMonths" min="0" max="11" value={formData.ageMonths} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"/>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" placeholder="Tell us about the pet..."></textarea>
          </div>

          {/* Image URL */}
          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
             <div className="flex gap-2">
               <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none" placeholder="https://..." />
               <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
                  {formData.imageUrl ? <img src={formData.imageUrl} alt="" className="w-full h-full object-cover"/> : <Upload size={20} className="text-gray-400" />}
               </div>
             </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg">
              {loading ? 'Saving...' : <><Save size={20} className="inline mr-2"/> Save Pet</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}