import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Filter, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PetCard from '../components/PetCard';
import PetDetailPage from './PetDetailPage';
import { useNavigate } from 'react-router-dom';


export default function PetBrowsePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);

  // Per-user storage keys
  const storageKey = user ? `selectedPet_${user._id}` : 'selectedPet_guest';
  const viewingDetailKey = user ? `viewingDetail_${user._id}` : 'viewingDetail_guest';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State Management
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAIMatch, setShowAIMatch] = useState(false);
  const [matchingWarning, setMatchingWarning] = useState(null); // 🆕 For backend warnings
  
  // Restore selectedPet from storage if we were viewing detail
  const [selectedPet, setSelectedPet] = useState(() => {
    const wasViewingDetail = sessionStorage.getItem(viewingDetailKey) === 'true';
    if (wasViewingDetail) {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error restoring pet:', e);
        }
      }
    }
    return null;
  });
  
  const [myRequests, setMyRequests] = useState([]); 

  const [filters, setFilters] = useState({
    species: 'All',
    size: 'All',
    temperament: 'All'
  });

  const prefs = user?.preferences || {};

  const isProfileComplete =
    prefs.preferredSize?.length > 0 &&
    prefs.preferredTemperament?.length > 0 &&
    prefs.preferredAge?.length > 0 &&
    !!prefs.experienceLevel;

  // Save selectedPet to storage
  useEffect(() => {
    if (selectedPet) {
      sessionStorage.setItem(storageKey, JSON.stringify(selectedPet));
      sessionStorage.setItem(viewingDetailKey, 'true');
    } else {
      sessionStorage.removeItem(storageKey);
      sessionStorage.setItem(viewingDetailKey, 'false');
    }
  }, [selectedPet, storageKey, viewingDetailKey]);

  // Initial Fetch
  useEffect(() => {
    fetchPets();
    if (user && user.id) {
      fetchMyRequests(user.id);
    } else {
      setMyRequests([]); 
    }
  }, [user]);

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

  const fetchMyRequests = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/adopters/${userId}/requests`);
      const data = await response.json();
      if (data.success) {
        const requestIds = data.requests.map(req => 
           typeof req.petId === 'object' ? req.petId._id : req.petId
        );
        setMyRequests(requestIds);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Filters & Smart Matching
  const applyFilters = () => {
    let result = [...pets];
    if (filters.species !== 'All') result = result.filter(pet => pet.species === filters.species);
    if (filters.size !== 'All') result = result.filter(pet => pet.size === filters.size);
    if (filters.temperament !== 'All') result = result.filter(pet => pet.labels.temperament.includes(filters.temperament));
    setFilteredPets(result);
    setShowAIMatch(false); // Turn off Smart Matching banner when manually filtering
    setMatchingWarning(null); // Clear any warnings
  };

  //  Improved Smart Matching with Preferences Check
  const getAIMatches = async () => {
    if (!user || !user.id) {
    alert("Please login to use Smart Pet Matching");
    navigate("/login");
    return;
  }

  if (!isProfileComplete) {
    alert(
      "Please complete your adoption preferences before using Smart Pet Matching.\n\n" +
      "This ensures accurate and responsible recommendations."
    );
    navigate("/profile");
    return;
  }

    setLoading(true);
    setMatchingWarning(null); // Reset warning
    
    try {
      const response = await fetch('http://localhost:5000/api/adopters/pets/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adopterId: user.id })
      });
      const data = await response.json();
      
      if (data.success) { 
        setFilteredPets(data.pets); 
        setShowAIMatch(true);
        
        //  Show warning if backend sent one
        if (data.warning) {
          setMatchingWarning(data.warning);
        }
      } else if (data.needsPreferences) {
        // Backend says preferences are needed
        alert(data.message);
      } else {
        alert('Matching failed: ' + data.message);
      }
    } catch (error) { 
      console.error(error);
      alert('Network error during matching');
    } finally { 
      setLoading(false); 
    }
  };

  const resetFilters = () => {
    setFilters({ species: 'All', size: 'All', temperament: 'All' });
    setFilteredPets(pets);
    setShowAIMatch(false);
    setMatchingWarning(null);
  };

  // Adoption Request
  const toggleAdoptionStatus = async (petId, isAlreadyRequested) => {
    if (!user || !user.id) {
      const shouldLogin = window.confirm("Please login to adopt! Would you like to go to the login page?");
      if (shouldLogin) {
        navigate("/login")
      }
      return;
    }

    try {
      if (isAlreadyRequested) {
        const confirmCancel = window.confirm("Are you sure you want to cancel this request?");
        if (!confirmCancel) return;

        const res = await fetch(`http://localhost:5000/api/adopters/${user.id}/request/${petId}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
          alert("Request cancelled.");
          setMyRequests(prev => prev.filter(id => id !== petId));
        }

      } else {
        const res = await fetch(`http://localhost:5000/api/adopters/${user.id}/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ petId })
        });
        const data = await res.json();

        if (data.success) {
          alert("Request submitted! 🎉");
          setMyRequests(prev => [...prev, petId]);
          await fetchPets(); // Refresh pets list
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  // Detail Page View
  if (selectedPet) {
    return (
      <PetDetailPage
        pet={selectedPet}
        onBack={() => {
          setSelectedPet(null);
          setTimeout(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: 'instant'
            });
          });
        }}
        onRequestSubmitted={() => {
          if (user?.id) fetchMyRequests(user.id);
        }}
      />
    );
  }

  // Browse Page
  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="content-wrapper">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Pet</h1>
          <p className="text-gray-600 mt-2">Browse available pets or use Smart Pet Matching</p>
        </div>
      </div>

      <div className="content-wrapper">
        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="mb-6">
            <button
              onClick={getAIMatches}
              disabled={!isProfileComplete}
              className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-3 shadow-lg transition-all
                ${
                  isProfileComplete
                    ? "bg-gradient-to-r from-[#FF8C42] to-[#FFA726] text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <Sparkles className="w-6 h-6" />
              {isProfileComplete
                ? "Use Smart Pet Matching"
                : "Complete Preferences to Use Smart Matching"}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Species', 'Size', 'Temperament'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{field}</label>
                <select 
                  value={filters[field.toLowerCase()]} 
                  onChange={(e) => setFilters(prev => ({ ...prev, [field.toLowerCase()]: e.target.value }))}
                  className="input-select"
                >
                  <option value="All">All {field}</option>
                  {field === 'Species' && <><option value="Dog">Dogs</option><option value="Cat">Cats</option></>}
                  {field === 'Size' && <><option value="Small">Small</option><option value="Medium">Medium</option><option value="Large">Large</option></>}
                  {field === 'Temperament' && <><option value="Calm">Calm</option><option value="Playful">Playful</option><option value="Friendly">Friendly</option><option value="Energetic">Energetic</option><option value="Independent">Independent</option></>}
                </select>
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <button onClick={applyFilters} className="flex-1 bg-[#FF8C42] hover:bg-[#e67e3b] text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Filter className="w-4 h-4" /> Apply
              </button>
              <button onClick={resetFilters} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Smart Matching Banner */}
        {showAIMatch && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-center gap-3 animate-fade-in">
            <Sparkles className="w-5 h-5 text-[#FF8C42]" />
            <p className="text-orange-900 font-medium">Showing smart-matched pets based on your preferences</p>
          </div>
        )}

        {/*  Warning Banner for incomplete preferences */}
        {matchingWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="flex-grow">
              <p className="text-yellow-900 font-medium">{matchingWarning}</p>
            </div>
          </div>
        )}

        {/* Pet Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#FF8C42] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => (
              <PetCard 
                key={pet._id} 
                pet={pet} 
                showScore={showAIMatch}
                isRequested={myRequests.includes(pet._id)}
                onToggleRequest={toggleAdoptionStatus}
                onViewDetails={() => {
                  setScrollPosition(window.scrollY);
                  setSelectedPet({ ...pet, _fromAI: showAIMatch });
                  window.scrollTo(0, 0);
                }}
              />
            ))}
          </div>
        )}
        
        {!loading && filteredPets.length === 0 && (
          <div className="text-center py-20">
             <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
             <h3 className="text-xl font-semibold text-gray-700">No pets found</h3>
             <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}