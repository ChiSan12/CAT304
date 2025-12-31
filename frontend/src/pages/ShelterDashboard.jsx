import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Dog, 
  FileText, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  MapPin, 
  Heart,
  XCircle,
  User
} from 'lucide-react';
import AddPetModal from '../components/AddPetModal';
import EditPetModal from '../components/EditPetModal';
import { useAuth } from '../context/AuthContext';

export default function ShelterDashboard() {
  const { user } = useAuth();
  const SHELTER_ID = user?.id;

  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState({ totalPets: 0, availablePets: 0, adoptedPets: 0, pendingRequests: 0 });
  const [pets, setPets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [strays, setStrays] = useState([]);
  const [profile, setProfile] = useState({ name: '', phone: '', location: { address: '', city: '', state: '' } });
  
  // UI States
  const [profileLoading, setProfileLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  
  // Rescue Modal State
  const [rescueModal, setRescueModal] = useState({ show: false, report: null });
  const [rescueForm, setRescueForm] = useState({ name: '', breed: '', ageYears: '', ageMonths: '', gender: 'Male' });

  // --- REFRESH FUNCTION ---
  const refreshData = () => {
    fetchStats();
    if (activeTab === 'pets') fetchPets();
    if (activeTab === 'requests') fetchRequests();
    if (activeTab === 'strays') fetchStrays();
    if (activeTab === 'settings') fetchProfile();
  };

  useEffect(() => {
    if (SHELTER_ID) refreshData();
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

  const fetchStrays = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reports`);
      const data = await res.json();
      if(data.success) setStrays(data.reports);
    } catch(err) { console.error(err); }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/shelters/${SHELTER_ID}`);
      const data = await res.json();
      if(data.success && data.shelter) {
         setProfile({
            ...data.shelter,
            location: data.shelter.location || { address: '', city: '', state: '' }
         });
      }
    } catch(err) { console.error(err); }
  };

  // --- ACTIONS ---
  const handleDeletePet = async (petId) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await fetch(`http://localhost:5000/api/shelters/pets/${petId}`, { method: 'DELETE' });
      refreshData();
    } catch(err) { alert("Error deleting pet"); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await fetch(`http://localhost:5000/api/shelters/${SHELTER_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      alert("Profile updated!");
    } catch(err) { alert("Update failed"); }
    setProfileLoading(false);
  };

  const handleRequestAction = async (adopterId, requestId, status, petId) => {
    if (!petId) return alert("Error: Missing Pet ID");
    try {
      await fetch(`http://localhost:5000/api/shelters/requests/${adopterId}/${requestId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status, petId })
      });
      setTimeout(() => { refreshData(); fetchStats(); }, 500);
    } catch(err) { console.error(err); }
  };

  const handleDeleteReport = async (id) => {
    if(!window.confirm("Delete this report?")) return;
    await fetch(`http://localhost:5000/api/reports/${id}`, { method: 'DELETE' });
    refreshData();
  };

  const handleStatusUpdate = async (id, status) => {
    await fetch(`http://localhost:5000/api/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    refreshData();
  };

  const openRescueModal = (report) => {
    setRescueForm({ name: '', breed: '', ageYears: '0', ageMonths: '0', gender: 'Male' });
    setRescueModal({ show: true, report });
  };

  const submitRescue = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/reports/${rescueModal.report._id}/rescue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rescueForm, shelterId: SHELTER_ID })
      });
      const data = await res.json();
      if(data.success) {
        alert("Pet Rescued and Added to Listings!");
        setRescueModal({ show: false, report: null });
        refreshData();
      } else {
        alert("Failed: " + data.message);
      }
    } catch(err) { console.error(err); }
  };

  if (!user || user.role !== 'shelter') return <div className="p-20 text-center text-red-600 font-bold">Access Denied</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-md p-6 fixed h-full z-10">
        <h2 className="text-2xl font-bold text-orange-600 mb-8">Shelter Admin</h2>
        <nav className="space-y-4">
          <NavButton icon={LayoutDashboard} label="Overview" id="overview" active={activeTab} set={setActiveTab} />
          <NavButton icon={Dog} label="Manage Pets" id="pets" active={activeTab} set={setActiveTab} />
          <NavButton icon={FileText} label="Requests" id="requests" active={activeTab} set={setActiveTab} />
          <NavButton icon={AlertTriangle} label="Stray Reports" id="strays" active={activeTab} set={setActiveTab} />
          <NavButton icon={Settings} label="Settings" id="settings" active={activeTab} set={setActiveTab} />
        </nav>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-8 ml-64">
        
        {/* OVERVIEW */}
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

        {/* MANAGE PETS */}
        {activeTab === 'pets' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Manage Pets</h1>
              <button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 shadow-lg">
                <Plus size={20}/> Add New Pet
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map(pet => (
                <div key={pet._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img src={pet.images?.[0]?.url || 'https://via.placeholder.com/300'} className="w-full h-48 object-cover rounded-lg mb-4" alt={pet.name}/>
                    <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-md text-white ${
                      pet.adoptionStatus === 'Available' ? 'bg-green-500' : 
                      pet.adoptionStatus === 'Adopted' ? 'bg-gray-500' : 'bg-yellow-500'
                    }`}>
                      {pet.adoptionStatus}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{pet.breed || 'Unknown'} • {pet.age?.years} yrs {pet.age?.months} mos</p>
                  
                  <div className="flex gap-2">
                    <button onClick={() => setEditingPet(pet)} className="flex-1 bg-gray-50 py-2 rounded-lg flex justify-center gap-2 hover:bg-gray-100 text-gray-700">
                      <Edit size={16}/> Edit
                    </button>
                    <button onClick={() => handleDeletePet(pet._id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REQUESTS */}
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
                   {requests.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-gray-500">No pending requests found.</td></tr> : 
                     requests.map(req => (
                     <tr key={req.requestId} className="border-b hover:bg-gray-50">
                       <td className="p-4 flex items-center gap-3">
                          <img src={req.petImage} className="w-8 h-8 rounded-full object-cover" alt="Pet"/>
                          <span className="font-medium">{req.petName}</span>
                       </td>
                       <td className="p-4">
                         <div className="font-bold text-gray-900">{req.adopterName}</div>
                         <div className="text-xs text-gray-500">{req.adopterEmail}</div>
                       </td>
                       <td className="p-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${
                           req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                           req.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                         }`}>
                           {req.status}
                         </span>
                       </td>
                       <td className="p-4">
                         {req.status === 'Pending' && (
                           <div className="flex gap-2">
                             <button onClick={() => handleRequestAction(req.adopterId, req.requestId, 'Approved', req.petId)} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors">Approve</button>
                             <button onClick={() => handleRequestAction(req.adopterId, req.requestId, 'Rejected', req.petId)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors">Reject</button>
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

        {/* STRAY REPORTS */}
        {activeTab === 'strays' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Public Stray Reports</h1>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
               <table className="w-full text-left">
                 <thead className="bg-gray-50 border-b">
                   <tr>
                     <th className="p-4 text-gray-600 font-medium">Date</th>
                     <th className="p-4 text-gray-600 font-medium">Animal</th>
                     {/* ADDED REPORTER HEADER */}
                     <th className="p-4 text-gray-600 font-medium">Reporter</th>
                     <th className="p-4 text-gray-600 font-medium">Location</th>
                     <th className="p-4 text-gray-600 font-medium">Status</th>
                     <th className="p-4 text-gray-600 font-medium text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {strays.length === 0 ? <tr><td colSpan="6" className="p-6 text-center text-gray-500">No stray reports found.</td></tr> : 
                     strays.map(r => (
                     <tr key={r._id} className="hover:bg-gray-50">
                       <td className="p-4 text-sm text-gray-600">
                         {new Date(r.createdAt).toLocaleDateString()}
                       </td>
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                            {r.image ? <img src={r.image} className="w-10 h-10 rounded object-cover border" alt="Stray"/> : <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">No Img</div>}
                            <div>
                                <div className="font-bold text-gray-900">{r.animalType}</div>
                                <div className="text-xs text-gray-500">{r.condition} • {r.number} Found</div>
                            </div>
                         </div>
                       </td>
                       
                       {/* ADDED REPORTER COLUMN */}
                       <td className="p-4">
                         <div className="flex items-start gap-2">
                           <User size={16} className="mt-1 text-gray-400" />
                           <div>
                             <div className="text-sm font-bold text-gray-900">{r.reportedBy?.fullName || 'Unknown'}</div>
                             <div className="text-xs text-gray-500">{r.reportedBy?.email}</div>
                             {r.reportedBy?.phone && <div className="text-xs text-gray-500">{r.reportedBy.phone}</div>}
                           </div>
                         </div>
                       </td>

                       <td className="p-4 max-w-xs truncate text-sm" title={r.placeDesc}>
                         {r.placeDesc}
                         <a href={`http://googleusercontent.com/maps.google.com/5{r.pin?.lat},${r.pin?.lng}`} target="_blank" rel="noreferrer" className="block text-xs text-blue-500 hover:underline mt-1 flex items-center gap-1">
                           <MapPin size={10} /> View Map
                         </a>
                       </td>
                       <td className="p-4">
                          <select 
                            value={r.status}
                            onChange={(e) => handleStatusUpdate(r._id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded-full border outline-none cursor-pointer ${
                              r.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              r.status === 'Rescued' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Investigating">Investigating</option>
                            <option value="Rescued">Rescued</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                       </td>
                       <td className="p-4 text-right flex justify-end gap-2">
                         {r.status === 'Pending' && (
                           <button onClick={() => openRescueModal(r)} className="bg-[#FF8C42] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600 flex items-center gap-1 shadow-sm">
                             <Heart size={12} className="fill-current"/> Rescue
                           </button>
                         )}
                         <button onClick={() => handleDeleteReport(r._id)} className="text-red-400 hover:text-red-600 p-1">
                           <Trash2 size={16}/>
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Shelter Settings</h1>
            <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
              <div><label className="block text-sm font-bold mb-2">Shelter Name</label><input className="w-full p-3 border rounded-xl" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} /></div>
              <div><label className="block text-sm font-bold mb-2">Contact Phone</label><input className="w-full p-3 border rounded-xl" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-sm font-bold mb-2">City</label><input className="w-full p-3 border rounded-xl" value={profile.location?.city || ''} onChange={(e) => setProfile({...profile, location: {...profile.location, city: e.target.value}})} /></div>
                 <div><label className="block text-sm font-bold mb-2">State</label><input className="w-full p-3 border rounded-xl" value={profile.location?.state || ''} onChange={(e) => setProfile({...profile, location: {...profile.location, state: e.target.value}})} /></div>
              </div>
              <div><label className="block text-sm font-bold mb-2">Address</label><textarea className="w-full p-3 border rounded-xl" rows="3" value={profile.location?.address || ''} onChange={(e) => setProfile({...profile, location: {...profile.location, address: e.target.value}})} /></div>
              <button disabled={profileLoading} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 shadow-lg">
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

      </div>

      <AddPetModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={refreshData} shelterId={SHELTER_ID} />
      <EditPetModal isOpen={!!editingPet} onClose={() => setEditingPet(null)} onSave={refreshData} pet={editingPet} />
      
      {/* RESCUE MODAL (With Age Fix) */}
      {rescueModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="bg-orange-500 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Heart className="fill-current" size={18}/> Rescue & Create Pet</h3>
              <button onClick={() => setRescueModal({ show: false, report: null })}><XCircle size={24} className="hover:text-gray-200"/></button>
            </div>
            <form onSubmit={submitRescue} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded">
                This will create a new pet listing using the photo and details from the stray report.
              </p>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Pet Name</label>
                <input required type="text" className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-orange-200 outline-none" 
                  value={rescueForm.name} onChange={e => setRescueForm({...rescueForm, name: e.target.value})} placeholder="e.g. Buddy"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Breed</label>
                  <input type="text" className="w-full border rounded p-2 mt-1" 
                    value={rescueForm.breed} onChange={e => setRescueForm({...rescueForm, breed: e.target.value})} placeholder="Mix"/>
                </div>
                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                  <select className="w-full border rounded p-2 mt-1" 
                    value={rescueForm.gender} onChange={e => setRescueForm({...rescueForm, gender: e.target.value})}>
                      <option>Male</option>
                      <option>Female</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Age (Years)</label>
                  <input type="number" min="0" className="w-full border rounded p-2 mt-1" 
                    value={rescueForm.ageYears} onChange={e => setRescueForm({...rescueForm, ageYears: e.target.value})} placeholder="0"/>
                </div>
                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Age (Months)</label>
                  <input type="number" min="0" max="11" className="w-full border rounded p-2 mt-1" 
                    value={rescueForm.ageMonths} onChange={e => setRescueForm({...rescueForm, ageMonths: e.target.value})} placeholder="0"/>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 shadow-md">
                Confirm Rescue
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// HELPERS
function NavButton({ icon: Icon, label, id, active, set }) {
  return (
    <button onClick={() => set(id)} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${active === id ? 'bg-orange-100 text-orange-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
      <Icon size={20} /> {label}
    </button>
  );
}

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</h3>
      <p className={`text-3xl font-extrabold mt-2 ${color}`}>{value}</p>
    </div>
  );
}