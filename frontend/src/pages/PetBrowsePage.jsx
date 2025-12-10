import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Star, Filter, Sparkles, Search } from 'lucide-react';

/**
 * Pet Browsing Component with AI-Powered Matching
 * Main feature of Module 2: Adopter Management
 */
export default function PetBrowsePage() {
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIMatch, setShowAIMatch] = useState(false);
  const [adopterId] = useState('674f5a3b8c9d1e2f3a4b5c6d'); // Mock adopter ID

  // Filter state
  const [filters, setFilters] = useState({
    species: 'All',
    size: 'All',
    temperament: 'All'
  });

  // Load all pets on mount
  useEffect(() => {
    fetchPets();
  }, []);

  // Fetch all available pets
  const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/adopters/pets/all');
      const data = await response.json();
      
      if (data.success) {
        setPets(data.pets);
        setFilteredPets(data.pets);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let result = [...pets];

    if (filters.species !== 'All') {
      result = result.filter(pet => pet.species === filters.species);
    }

    if (filters.size !== 'All') {
      result = result.filter(pet => pet.size === filters.size);
    }

    if (filters.temperament !== 'All') {
      result = result.filter(pet => 
        pet.labels.temperament.includes(filters.temperament)
      );
    }

    setFilteredPets(result);
  };

  // Get AI-matched pets
  const getAIMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/adopters/pets/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adopterId })
      });

      const data = await response.json();
      
      if (data.success) {
        setFilteredPets(data.pets);
        setShowAIMatch(true);
      }
    } catch (error) {
      console.error('Error getting AI matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset to all pets
  const resetFilters = () => {
    setFilters({
      species: 'All',
      size: 'All',
      temperament: 'All'
    });
    setFilteredPets(pets);
    setShowAIMatch(false);
  };

  // Handle adopt request
  const handleAdoptRequest = async (petId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/adopters/${adopterId}/request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ petId })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        alert('Adoption request submitted successfully! 🎉');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error submitting request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Pet</h1>
          <p className="text-gray-600 mt-2">Browse available pets or use AI matching to find your ideal companion</p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* AI Match Button */}
          <div className="mb-6">
            <button
              onClick={getAIMatches}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-6 h-6" />
              Get AI-Powered Recommendations
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Species Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Species
              </label>
              <select
                value={filters.species}
                onChange={(e) => setFilters(prev => ({ ...prev, species: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="All">All Species</option>
                <option value="Dog">Dogs</option>
                <option value="Cat">Cats</option>
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={filters.size}
                onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="All">All Sizes</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>

            {/* Temperament Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperament
              </label>
              <select
                value={filters.temperament}
                onChange={(e) => setFilters(prev => ({ ...prev, temperament: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="All">All Temperaments</option>
                <option value="Calm">Calm</option>
                <option value="Playful">Playful</option>
                <option value="Energetic">Energetic</option>
                <option value="Friendly">Friendly</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {showAIMatch && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Star className="w-5 h-5 text-purple-600" />
            <p className="text-purple-900 font-medium">
              Showing AI-matched pets based on your preferences (sorted by compatibility score)
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Pet Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <PetCard 
                key={pet._id} 
                pet={pet} 
                showScore={showAIMatch}
                onAdopt={handleAdoptRequest}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredPets.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No pets found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new arrivals</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual Pet Card Component
 */
function PetCard({ pet, showScore, onAdopt }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Pet Image */}
      <div className="relative h-64 bg-gray-200">
        <img
          src={pet.images?.[0]?.url || '/api/placeholder/400/300'}
          alt={pet.name}
          className="w-full h-full object-cover"
        />
        
        {/* Compatibility Score Badge */}
        {showScore && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{pet.compatibilityScore}% Match</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            pet.adoptionStatus === 'Available' 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {pet.adoptionStatus}
          </span>
        </div>
      </div>

      {/* Pet Info */}
      <div className="p-6">
        {/* Name & Basic Info */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>{pet.breed}</span>
          <span>•</span>
          <span>{pet.age.years}y {pet.age.months}m</span>
          <span>•</span>
          <span>{pet.gender}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {pet.description}
        </p>

        {/* Labels */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
            {pet.size}
          </span>
          {pet.labels.temperament.slice(0, 2).map((trait, idx) => (
            <span 
              key={idx}
              className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
            >
              {trait}
            </span>
          ))}
        </div>

        {/* Shelter Location */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <MapPin className="w-4 h-4" />
          <span>{pet.shelterId?.name || 'SPCA Penang'}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onAdopt(pet._id)}
          disabled={pet.adoptionStatus !== 'Available'}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Heart className="w-5 h-5" />
          {pet.adoptionStatus === 'Available' ? 'Adopt Me' : 'Not Available'}
        </button>
      </div>
    </div>
  );
}