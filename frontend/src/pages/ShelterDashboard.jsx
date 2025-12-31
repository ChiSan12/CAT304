import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ShelterLayout from "../components/ShelterLayout";

export default function ShelterDashboard() {
  const { user } = useAuth();
  const SHELTER_ID = user?.id;

  // Data States
  const [stats, setStats] = useState({
    totalPets: 0,
    availablePets: 0,
    adoptedPets: 0,
    pendingRequests: 0,
  });

  // --- REFRESH FUNCTION ---
  const refreshData = () => {
    fetchStats();
  };

  useEffect(() => {
    if (SHELTER_ID) refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SHELTER_ID]);

  // --- API FUNCTIONS ---
  const fetchStats = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/shelters/${SHELTER_ID}/stats`
      );
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== "shelter")
    return (
      <div className="p-20 text-center text-red-600 font-bold">
        Access Denied
      </div>
    );

  return (
    <ShelterLayout>
      <div className="flex-1 p-8 ml-64">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Dashboard Overview
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Pets" value={stats.totalPets} />
            <StatCard label="Available" value={stats.availablePets} />
            <StatCard label="Adopted" value={stats.adoptedPets} />
            <StatCard
              label="Pending Requests"
              value={stats.pendingRequests}
              color="text-red-600"
            />
          </div>
        </div>
      </div>
    </ShelterLayout>
  );
}

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
        {label}
      </h3>
      <p className={`text-3xl font-extrabold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
