import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Dog, FileText, Settings, Plus, Trash2, Edit, Save, MapPin, Phone } from 'lucide-react';
import AddPetModal from '../components/AddPetModal';
import EditPetModal from '../components/EditPetModal';
import { useAuth } from '../context/AuthContext';

export default function ShelterDashboard() {
  const { user } = useAuth();
  const SHELTER_ID = user?.id;

  // Tabs state
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [stats, setStats] = useState({ totalPets: 0, availablePets: 0, adoptedPets: 0, pendingRequests: 0 });
  const [pets, setPets] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // Profile state
  const [profile, setProfile] = useState({ name: '', phone: '', location: { address: '', city: '', state: '' } });
  const [profileLoading, setProfileLoading] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  // Initial Fetch
  useEffect(() => {
    if (!SHELTER_ID) return;
    
    fetchStats();
    if (activeTab === 'pets') fetchPets();
    if (activeTab === 'requests') fetchRequests();
    if (activeTab === 'settings') fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, SHELTER_ID]);

  // --- API FUNCTIONS ---
  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/shelters/${SHELTER_ID}/stats`);
      const data = await res.json();
      if(data.success) setStats(data.stats);
    } catch(err) { console.error(err); }
  };

  const fetchPets = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/shelters/${SHELTER_ID}/pets`);
      const data = await res.json();
      if(data.success) setPets(data.pets);
    } catch(err) { console.error(err); }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/shelters/${SHELTER_ID}/requests`);
      const data = await res.json();
      if(data.success) setRequests(data.requests);
    } catch(err) { console.error(err); }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/shelters/${SHELTER_ID}`);
      const data = await res.json();
      if(data.success && data.shelter) {
         // Ensure location object exists to prevent crashes
         const safeProfile = {
            ...data.shelter,
            location: data.shelter.location || { address: '', city: '', state: '' }
         };
         setProfile(safeProfile);
      }
    } catch(err) { console.error(err); }
  };

  // --- ACTION HANDLERS ---
  const handleDeletePet = async (petId) => {
    if(!window.confirm("Are you sure you want to delete this pet? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/shelters/pets/${petId}`, { method: 'DELETE' });
      const data = await res.json();
      if(data.success) {
        fetchPets();
        fetchStats();
      } else {
        alert("Failed to delete: " + data.message);
      }
    } catch(err) { alert("Network error"); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/shelters/${SHELTER_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if(data.success) alert("Profile updated successfully!");
      else alert("Update failed");
    } catch(err) { alert("Failed to update profile"); }
    setProfileLoading(false);
  };

  const handleRequestAction = async (adopterId, requestId, status) => {
    try {
      await fetch(`http://localhost:5000/api/shelters/requests/${adopterId}/${requestId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status })
      });
      fetchRequests();
      fetchStats();
    } catch(err) { console.error(err); }
  };

  // Check Access
  if (!user || user.role !== 'shelter') {
    return <div className="p-20 text-center text-red-600 font-bold">Access Denied: Shelter Admin Only</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6 fixed h-full">
        <h2 className="text-2xl font-bold text-orange-600 mb-8">Shelter Admin</h2>
        <nav className="space-y-4">
          <NavButton icon={LayoutDashboard} label="Overview" id="overview" active={activeTab} set={setActiveTab} />
          <NavButton icon={Dog} label="Manage Pets" id="pets" active={activeTab} set={setActiveTab} />
          <NavButton icon={FileText} label="Requests" id="requests" active={activeTab} set={setActiveTab} />
          <NavButton icon={Settings} label="Settings" id="settings" active={activeTab} set={setActiveTab} />
        </nav>
      </div>

      {/* Main Content Area - Added margin-left to account for fixed sidebar */}
      <div className="flex-1 p-8 ml-64">
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Pets" value={stats.totalPets} />
              <StatCard label="Available" value={stats.availablePets} />
              <StatCard label="Adopted" value={stats.adoptedPets} />
              <StatCard label="Pending Requests" value={stats.pendingRequests} color="text-red-600" />
            </div>
          </div>
        )}

        {/* 2. PET MANAGEMENT TAB */}
        {activeTab === 'pets' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Manage Pets</h1>
              <button 
                onClick={() => setIsAddModalOpen(true)} 
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-orange-500/30"
              >
                <Plus size={20}/> Add New Pet
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map(pet => (
                <div key={pet._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={pet.images?.[0]?.url || 'https://via.placeholder.com/300'} 
                      alt={pet.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-md text-white ${
                      pet.adoptionStatus === 'Available' ? 'bg-green-500' : 
                      pet.adoptionStatus === 'Adopted' ? 'bg-gray-500' : 'bg-yellow-500'
                    }`}>
                      {pet.adoptionStatus}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{pet.breed || 'Unknown Breed'} • {pet.age?.years} yrs</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingPet(pet)} 
                      className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                      <Edit size={16}/> Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePet(pet._id)} 
                      className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pets.length === 0 && <p className="text-gray-500 text-center mt-10">No pets found. Add one to get started!</p>}
          </div>
        )}

        {/* 3. REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Adoption Requests</h1>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
               <table className="w-full text-left">
                 <thead className="bg-gray-50 border-b">
                   <tr>
                     <th className="p-4 text-gray-600 font-medium">Pet</th>
                     <th className="p-4 text-gray-600 font-medium">Adopter</th>
                     <th className="p-4 text-gray-600 font-medium">Status</th>
                     <th className="p-4 text-gray-600 font-medium">Action</th>
                   </tr>
                 </thead>
                 <tbody>
                   {requests.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">No pending requests found.</td></tr>
                   ) : requests.map(req => (
                     <tr key={req.requestId} className="border-b hover:bg-gray-50 transition-colors">
                       <td className="p-4 font-medium flex items-center gap-3">
                          <img src={req.petImage} alt="" className="w-8 h-8 rounded-full object-cover"/>
                          {req.petName}
                       </td>
                       <td className="p-4">
                         <div className="font-bold text-gray-900">{req.adopterName}</div>
                         <div className="text-sm text-gray-500">{req.adopterEmail}</div>
                         <div className="text-sm text-gray-500">{req.adopterPhone}</div>
                       </td>
                       <td className="p-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${
                           req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                           req.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                           'bg-red-100 text-red-800'
                         }`}>
                           {req.status}
                         </span>
                       </td>
                       <td className="p-4">
                         {req.status === 'Pending' && (
                           <div className="flex gap-2">
                             <button onClick={() => handleRequestAction(req.adopterId, req.requestId, 'Approved')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">Approve</button>
                             <button onClick={() => handleRequestAction(req.adopterId, req.requestId, 'Rejected')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">Reject</button>
                           </div>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {/* 4. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Shelter Settings</h1>
            <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Shelter Name</label>
                <input 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                  <input 
                    className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    value={profile.phone} 
                    onChange={(e) => setProfile({...profile, phone: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                    <input 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={profile.location?.city || ''} 
                      onChange={(e) => setProfile({...profile, location: {...profile.location, city: e.target.value}})} 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                    <input 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                      value={profile.location?.state || ''} 
                      onChange={(e) => setProfile({...profile, location: {...profile.location, state: e.target.value}})} 
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20}/>
                  <textarea 
                    className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    rows="3"
                    value={profile.location?.address || ''} 
                    onChange={(e) => setProfile({...profile, location: {...profile.location, address: e.target.value}})} 
                  />
                </div>
              </div>

              <button 
                disabled={profileLoading} 
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 flex justify-center items-center gap-2 transition-all shadow-lg shadow-orange-500/30"
              >
                {profileLoading ? 'Saving...' : <><Save size={20}/> Save Profile</>}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* MODALS */}
      <AddPetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={() => { fetchPets(); fetchStats(); }} 
        shelterId={SHELTER_ID} 
      />
      
      <EditPetModal 
        isOpen={!!editingPet} 
        onClose={() => setEditingPet(null)} 
        onSave={() => { fetchPets(); fetchStats(); }} 
        pet={editingPet} 
      />
    </div>
  );
}

// ================= HELPER COMPONENTS =================

function NavButton({ icon: Icon, label, id, active, set }) {
  return (
    <button 
      onClick={() => set(id)} 
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
        active === id ? 'bg-orange-100 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} /> {label}
    </button>
  );
}

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</h3>
      <p className={`text-3xl font-extrabold mt-2 ${color}`}>{value}</p>
    </div>
  );
}