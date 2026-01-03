import React, { useState, useEffect, useRef } from 'react';
import CareReminderList from '../components/CareReminderList';
import VetClinicMap from '../components/VetClinicMap';
import { useAuth } from '../context/AuthContext';

import {
  TrainingTips,
  NutritionTips,
  OwnershipTips,
} from '../components/EducationResources';

/* ================= POST-ADOPTION MODULE ================= */

export default function CarePlanPage({ pet, onClose }) {
  const { user } = useAuth();
  const [isLarge, setIsLarge] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const contentRef = React.useRef(null);

  // auto-scroll when section changes
  useEffect(() => {
    if (contentRef.current) {
    contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
    }
  }, [activeSection]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center pt-24 z-50">
      <div
        className={`bg-gray-50 rounded-2xl shadow-xl transition-all flex flex-col ${
          isLarge ? 'w-[95%] max-w-6xl' : 'w-full max-w-4xl'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF8C42] to-[#FFA726] text-white px-6 py-3 flex justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
          {activeSection && (
            <button
              onClick={() => setActiveSection(null)}
              className="text-lg hover:bg-white/20 rounded px-2"
            >
              ←
            </button>
          )}
          <h3 className="font-semibold">
            {pet.petId.name} – Post-Adoption Care
          </h3>
          </div>

          <div className="flex gap-3 text-xl">
            <button 
              onClick={() => setIsLarge(!isLarge)}>
              □
            </button>
            <button onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentRef} // ⭐ MODIFIED
          className="flex-1 p-6 overflow-y-auto transition-all duration-300"
        >

          {/* OVERVIEW GRID */}
          {!activeSection && (
            <div className="grid grid-cols-1 gap-4">
              <CategoryCard
                icon="🩺"
                bg="bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-200"
                title="Care & Health Reminders"
                description="Vaccination status and upcoming care schedules"
                onClick={() => setActiveSection('care')}
              />

              <CategoryCard
                icon="📸"
                bg="bg-gradient-to-br from-gray-50 to-slate-100 border-slate-200"
                title="Pet Update"
                description="Submit health, behaviour or progress updates"
                onClick={() => setActiveSection('update')}
              />

              <CategoryCard
                icon="🏥"
                bg="bg-gradient-to-br from-indigo-50 to-blue-100 border-blue-200"
                title="Nearby Veterinary Clinics"
                description="Find trusted clinics near you"
                onClick={() => setActiveSection('vet')}
              />

              <CategoryCard
                icon="📚"
                bg="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200"
                title="Educational Resources"
                description="Training, nutrition and ownership guides"
                onClick={() => setActiveSection('education')}
              />
            </div>
          )}

          {/* 🩺 CARE & HEALTH */}
          {activeSection === 'care' && (
            <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
              
              {/* Header */}
              <div className="bg-white rounded-2xl border p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
                    🩺
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">
                      Care & Health Reminders
                    </h4>
                    <p className="text-sm text-gray-500">
                      Track upcoming vaccinations, treatments, and follow-ups
                    </p>
                  </div>
                </div>
              </div>

              {/* 🔔 Dynamic Reminder List */}
              <CareReminderList
                petId={pet.petId._id}
                role="adopter"
              />
            </div>
          )}

          {/* 📸 PET UPDATE */}
          {activeSection === 'update' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <PetUpdateCard pet={pet} user={user} />
            </div>
          )}

          {/* 🏥 VET CLINICS */}
          {activeSection === 'vet' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <VetClinicMap/>
            </div>
          )}



          {/* EDUCATION */}
          {activeSection === 'education' && (
            <div className="max-w-3xl mx-auto animate-fade-in">

              {/* Header with icon */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF8C42] to-[#FFA726] rounded-2xl mb-4 shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Educational Resources
                </h3>
                <p className="text-gray-600">
                  Everything you need to care for your new companion
                </p>
              </div>

              {/* Resource Cards */}
              <div className="grid grid-cols-1 gap-4">
                {/* Training Tips Card */}
                <button
                  onClick={() => setActiveSection('training')}
                  className="group bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 text-left hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                      🐾
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        Pet Training Tips
                      </h4>
                      <p className="text-sm text-gray-600">
                        Learn effective techniques to train and bond with your pet
                      </p>
                    </div>
                    <div className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                      →
                    </div>
                  </div>
                </button>

                {/* Nutrition Guidelines Card */}
                <button
                  onClick={() => setActiveSection('nutrition')}
                  className="group bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 text-left hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                      🥣
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                        Nutrition Guidelines
                      </h4>
                      <p className="text-sm text-gray-600">
                        Discover the best diet and feeding practices for your pet
                      </p>
                    </div>
                    <div className="text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all">
                      →
                    </div>
                  </div>
                </button>

                {/* Responsible Ownership Card */}
                <button
                  onClick={() => setActiveSection('ownership')}
                  className="group bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl p-6 text-left hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                      ❤️
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                        Responsible Ownership
                      </h4>
                      <p className="text-sm text-gray-600">
                        Understand your responsibilities as a loving pet parent
                      </p>
                    </div>
                    <div className="text-gray-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all">
                      →
                    </div>
                  </div>
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#FF8C42] rounded-lg flex items-center justify-center text-xl">
                    💡
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">
                      Why Education Matters
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Proper education is the foundation of a happy, healthy relationship with your pet. 
                      These resources will help you provide the best care possible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🐾 TRAINING */}
          {activeSection === 'training' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <button
                onClick={() => setActiveSection('education')}
                className="text-sm text-gray-500 mb-6 hover:text-[#FF8C42] transition-colors flex items-center gap-2"
              >
                ← Back to Educational Resources
              </button>

              {/* Header with styling */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                    🐾
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Pet Training Tips</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Build a strong bond with your {pet?.petId?.species?.toLowerCase() || 'pet'}
                    </p>
                  </div>
                </div>
              </div>
              <TrainingTips species={pet?.petId?.species} />
            </div>
          )} 

          {/* 🥣 NUTRITION */}
          {activeSection === 'nutrition' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <button
                onClick={() => setActiveSection('education')}
                className="text-sm text-gray-500 mb-6 hover:text-[#FF8C42] transition-colors flex items-center gap-2"
              >
                ← Back to Educational Resources
              </button>

              {/* Header with styling */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                    🥣
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Nutrition Guidelines</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Keep your pet healthy with proper nutrition
                    </p>
                  </div>
                </div>
              </div>

              <NutritionTips />
            </div>
          )}

                    {/* ❤️ OWNERSHIP */}
          {activeSection === 'ownership' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <button
                onClick={() => setActiveSection('education')}
                className="text-sm text-gray-500 mb-6 hover:text-[#FF8C42] transition-colors flex items-center gap-2"
              >
                ← Back to Educational Resources
              </button>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-pink-500 rounded-xl flex items-center justify-center text-3xl shadow-lg">
                    ❤️
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Responsible Ownership</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Be the best pet parent you can be
                    </p>
                  </div>
                </div>
              </div>

              <OwnershipTips />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PetUpdateCard({ pet, user }) {
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState('');
  const [condition, setCondition] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // Handle image upload + preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async () => {
    if (!notes.trim()) return;

    console.log({
      petId: pet.petId?._id,
      adopterId: user.id,
      shelterId: pet.petId?.shelterId
    });

    const formData = new FormData();
    formData.append('petId', pet.petId._id);
    formData.append('adopterId', user.id);
    formData.append('shelterId', pet.petId.shelterId);

    formData.append('notes', notes);
    formData.append('weight', weight);
    formData.append('condition', condition);

    images.forEach((img) => {
      formData.append('images', img);
    });

    try {
      await fetch('http://localhost:5000/api/pet-updates', {
        method: 'POST',
        body: formData,
    });

    setSubmitted(true);
    // setTimeout(() => setSubmitted(false), 3000);

    setNotes('');
    setWeight('');
    setCondition('');
    setImages([]);
    setPreviewImages([]); 
    
    setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Submit pet update failed:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl">
          📸
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-800">Pet Update</h4>
          <p className="text-sm text-gray-500">
            Share your pet’s latest health and progress
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">

        {/* Notes */}
        <textarea
          className="w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
          rows={4}
          placeholder="Describe your pet’s health, behaviour, or any concerns..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Pet Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            className="border rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
            placeholder="Weight (e.g. 12kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />

          <select
            className="border rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Condition</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Needs Attention">Needs Attention</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Pet Photos
          </label>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm"
          />

          {/* Preview */}
          {previewImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {previewImages.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="preview"
                  className="h-24 w-full object-cover rounded-lg border"
                />
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!notes.trim()}
          className={`px-6 py-3 rounded-xl text-sm font-medium text-white transition
            ${
              notes.trim()
                ? 'bg-[#FF8C42] hover:bg-[#e67e3b]'
                : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          Submit Update
        </button>

        {/* Success */}
        {submitted && (
          <p className="text-sm text-green-600">
            ✅ Update submitted successfully
          </p>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ icon, bg, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full text-left rounded-2xl p-6 border
        ${bg}
        hover:shadow-xl hover:scale-[1.02]
        transition-all duration-300
      `}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-md bg-white/80">
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1">
          <h4 className="text-xl font-bold text-gray-800">
            {title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        </div>

        {/* Arrow */}
        <div className="text-gray-400 group-hover:translate-x-1 transition">
          →
        </div>
      </div>
    </button>
  );
}