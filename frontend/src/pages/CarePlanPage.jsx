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

            <div className="flex gap-2">
            {/* Maximize/Minimize Button */}
            <button 
              onClick={() => setIsLarge(!isLarge)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/20 active:bg-white/30 transition-all duration-200 transform hover:scale-110 active:scale-95 group relative overflow-hidden"
              aria-label={isLarge ? "Minimize" : "Maximize"}
              title={isLarge ? "Minimize" : "Maximize"}
            >
              {/* Animated background effect */}
              <span className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              
              {/* Icon with smooth transition */}
              <svg 
                className="w-5 h-5 relative z-10 transition-all duration-300 group-hover:scale-110" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isLarge ? (
                  // Minimize icon - window with arrow pointing inward
                  <>
                    <rect x="4" y="4" width="16" height="16" rx="2" className="transition-all duration-300" />
                    <path d="M9 9l6 6M15 9l-6 6" className="opacity-70" />
                  </>
                ) : (
                  // Maximize icon - expanding arrows
                  <>
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" 
                      className="transition-all duration-300 group-hover:scale-110" 
                      style={{ transformOrigin: 'center' }}
                    />
                  </>
                )}
              </svg>
            </button>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-500/90 active:bg-red-600 transition-all duration-200 transform hover:scale-110 active:scale-95 group"
              aria-label="Close"
              title="Close"
            >
              <span className="text-2xl group-hover:rotate-90 transition-transform duration-300 leading-none">
                ×
              </span>
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
            <div className="grid space-y-6 grid-cols-1 gap-4">
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Handle image upload + preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Remove individual image
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  // Handle notes change with character count
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = async () => {
    if (!notes.trim()) return;

    setIsSubmitting(true);

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
      setNotes('');
      setWeight('');
      setCondition('');
      setImages([]);
      setPreviewImages([]);
      setCharCount(0);

      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Submit pet update failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md">
      {/* Header with animation */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl transform transition-transform hover:scale-110">
          📸
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-800">Pet Update</h4>
          <p className="text-sm text-gray-500">
            Share your pet's latest health and progress
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Notes with character counter */}
        <div className="relative">
          <textarea
            className="w-full border rounded-xl p-4 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all resize-none"
            rows={4}
            placeholder="Describe your pet's health, behaviour, or any concerns..."
            value={notes}
            onChange={handleNotesChange}
            maxLength={500}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {charCount}/500
          </div>
        </div>

        {/* Pet Details with icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              ⚖️
            </span>
            <input
              type="text"
              className="w-full border rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all"
              placeholder="Weight (e.g. 12kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              ❤️
            </span>
            <select
              className="w-full border rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all appearance-none bg-white cursor-pointer"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="">Select Condition</option>
              <option value="Excellent">✨ Excellent</option>
              <option value="Good">😊 Good</option>
              <option value="Fair">😐 Fair</option>
              <option value="Needs Attention">⚠️ Needs Attention</option>
            </select>
          </div>
        </div>

        {/* Image Upload with improved UI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Pet Photos
          </label>

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">PNG, JPG or GIF</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Preview with remove button */}
          {previewImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {previewImages.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={src}
                    alt="preview"
                    className="h-24 w-full object-cover rounded-lg border transition-all group-hover:opacity-75"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button with loading state */}
        <button
          onClick={handleSubmit}
          disabled={!notes.trim() || isSubmitting}
          className={`w-full px-6 py-3 rounded-xl text-sm font-medium text-white transition-all transform active:scale-95
            ${
              notes.trim() && !isSubmitting
                ? 'bg-[#FF8C42] hover:bg-[#e67e3b] hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Update'
          )}
        </button>

        {/* Success Message with animation */}
        {submitted && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-pulse">
            <span className="text-xl">✅</span>
            <p className="text-sm text-green-700 font-medium">
              Update submitted successfully!
            </p>
          </div>
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
        group w-full text-left rounded-2xl px-7 py-5 border
        ${bg}
        hover:shadow-xl hover:scale-[1.02]
        transition-all duration-300
      `}
    >
      <div className="flex items-center gap-5">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm bg-white/80">
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