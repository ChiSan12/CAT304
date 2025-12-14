import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  PawPrint,
  Heart,
  Settings,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MyDashboard() {
  const { user } = useAuth();
  const adopterId = user?.id;
  const [selectedPet, setSelectedPet] = useState(null);

  const [stats, setStats] = useState({
    reports: 0,
    adoptedPets: 0,
    pendingApplications: 0,
    animalsHelped: 0
  });

  const [adoptedPets, setAdoptedPets] = useState([]);
  const [showMyPets, setShowMyPets] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/adopters/${adopterId}`);
      const data = await res.json();

      if (data.success) {
        setAdoptedPets(data.adoptedPets || []);
        setStats({
          reports: 2,
          adoptedPets: data.adoptedPets.length,
          pendingApplications: data.adoptionRequests.filter(
            r => r.status === 'Pending'
          ).length,
          animalsHelped: data.adoptedPets.length + 2
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            My Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your adoption journey and activities in one place
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Management */}
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          My Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <DashboardCard
            icon={ClipboardList}
            title="My Reports"
            description="View and manage your stray animal reports"
          />

          <DashboardCard
            icon={PawPrint}
            title="My Pets"
            description="Manage adopted pets and care information"
            onClick={() => setShowMyPets(p => !p)}
          />

          <DashboardCard
            icon={Heart}
            title="My Adoptions"
            description="Track adoption applications and history"
          />

          <DashboardCard
            icon={Settings}
            title="Account Settings"
            description="Update profile and preferences"
          />
        </div>

        {/* My Pets */}
        {showMyPets && (
          <div className="bg-white rounded-xl border p-6 mb-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              My Adopted Pets
            </h3>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : adoptedPets.length === 0 ? (
              <p className="text-gray-500">
                You have not adopted any pets yet 🐾
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {adoptedPets.map(item => (
                  <div
                    key={item.petId._id}
                    className="border rounded-lg p-4 hover:shadow-sm transition"
                    onClick={() => setSelectedPet(item.petId)}
                  >
                    <h4 className="font-semibold text-gray-900">
                      {item.petId.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Species: {item.petId.species}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-600">
                      Adopted
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post-Adoption Section (ONLY after adoption) */}
        {selectedPet && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-12">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Post-Adoption Care – {selectedPet.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PostAdoptionCard
                title="Care Guide"
                description="View daily care and feeding instructions"
              />

              <PostAdoptionCard
                title="Health Records"
                description="Track vaccinations and vet visits"
              />

              <PostAdoptionCard
                title="Follow-up Report"
                description="Submit post-adoption feedback"
              />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Quick Stats
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Total Reports" value={stats.reports} />
            <StatBox label="Adopted Pets" value={stats.adoptedPets} />
            <StatBox label="Pending Applications" value={stats.pendingApplications} />
            <StatBox label="Animals Helped" value={stats.animalsHelped} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function DashboardCard({ icon: Icon, title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border p-6 cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-lg bg-orange-100">
          <Icon className="w-6 h-6 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>

      <p className="text-gray-600 text-sm mb-5">
        {description}
      </p>

      <button className="text-sm font-medium text-orange-500 hover:underline">
        View Details →
      </button>
    </div>
  );
}

function PostAdoptionCard({ title, description }) {
  return (
    <div className="border rounded-lg p-5 bg-gray-50 hover:bg-gray-100 transition">
      <h4 className="font-semibold text-gray-900 mb-2">
        {title}
      </h4>
      <p className="text-sm text-gray-600 mb-3">
        {description}
      </p>
      <button className="text-indigo-600 font-medium hover:underline">
        Open →
      </button>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-5 text-center border">
      <p className="text-2xl font-bold text-orange-500 mb-1">
        {value}
      </p>
      <p className="text-sm text-gray-600">
        {label}
      </p>
    </div>
  );
}