import React, { useEffect, useState, useCallback } from "react";
import {
  Heart,
  PawPrint,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  AlertCircle,
  Settings
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      adoptedPets: 0,
    },
    requests: [],
    adoptedPets: [],
  });

  const loadDashboard = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/adopters/${user.id}`);
      const data = await res.json();

      if (data.success) {
        const requests = data.adopter.adoptionRequests || [];
        const dbAdopted = data.adopter.adoptedPets || [];

        // Treat 'Approved' requests as Adopted pets
        const approvedAsAdopted = requests
          .filter((r) => r.status === "Approved")
          .map((r) => ({
            petId: r.petId,
            adoptionDate: r.requestDate,
            _id: r._id,
          }));

        // Combine adopted pets
        const uniqueAdoptedMap = new Map();
        [...dbAdopted, ...approvedAsAdopted].forEach((item) => {
          if (item.petId?._id) {
            uniqueAdoptedMap.set(item.petId._id, item);
          }
        });

        const allAdopted = Array.from(uniqueAdoptedMap.values());

        setDashboardData({
          stats: {
            totalRequests: requests.length,
            pendingRequests: requests.filter((r) => r.status === "Pending").length,
            approvedRequests: requests.filter((r) => r.status === "Approved").length,
            rejectedRequests: requests.filter((r) => r.status === "Rejected").length,
            adoptedPets: allAdopted.length,
          },
          requests: requests,
          adoptedPets: allAdopted,
        });
      }
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
  if (!user) {
    navigate("/login");
    return;
  }

  loadDashboard();
  }, [user, navigate, loadDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF8C42] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF8C42] to-[#FFA726] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-white/90">Welcome back, {user?.fullName}! 👋</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/*  Preferences Completion Status Card */}
        <PreferencesStatusCard user={user} />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Heart}
            label="Total Requests"
            value={dashboardData.stats.totalRequests}
            color="orange"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={dashboardData.stats.pendingRequests}
            color="yellow"
          />
          <StatCard
            icon={CheckCircle}
            label="Approved"
            value={dashboardData.stats.approvedRequests}
            color="green"
          />
          <StatCard
            icon={XCircle}
            label="Rejected"
            value={dashboardData.stats.rejectedRequests}
            color="red"
          />
          <StatCard
            icon={PawPrint}
            label="Adopted"
            value={dashboardData.stats.adoptedPets}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              label="Overview"
            />
            <TabButton
              active={activeTab === "requests"}
              onClick={() => setActiveTab("requests")}
              label={`Requests (${dashboardData.requests.length})`}
            />
            <TabButton
              active={activeTab === "adopted"}
              onClick={() => setActiveTab("adopted")}
              label={`Adopted Pets (${dashboardData.adoptedPets.length})`}
            />
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && <OverviewTab data={dashboardData} />}

            {activeTab === "requests" && (
              <RequestsTab
                requests={dashboardData.requests}
                onRefresh={loadDashboard}
                adopterId={user.id}
              />
            )}

            {activeTab === "adopted" && (
              <AdoptedPetsTab pets={dashboardData.adoptedPets} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Components ============ */

//  Preferences Status Card Component
function PreferencesStatusCard({ user }) {
  const prefs = user?.preferences || {};
  const navigate = useNavigate();
  
  // Calculate completion status
  const checks = [
    { 
      label: 'Preferred Size', 
      completed: prefs.preferredSize && prefs.preferredSize.length > 0,
      description: 'Help us find the right size pet for your home'
    },
    { 
      label: 'Preferred Temperament', 
      completed: prefs.preferredTemperament && prefs.preferredTemperament.length > 0,
      description: 'Match pets with your lifestyle'
    },
    { 
      label: 'Living Situation', 
      completed: prefs.hasGarden !== undefined || prefs.hasChildren !== undefined || prefs.hasOtherPets !== undefined,
      description: 'Essential for accurate pet matching'
    },
  ];
  
  const completedCount = checks.filter(c => c.completed).length;
  const completionPercentage = Math.round((completedCount / checks.length) * 100);
  const isComplete = completedCount === checks.length;
  
  // Don't show if preferences are complete
  if (isComplete) return null;
  
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8 shadow-md">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-yellow-100 rounded-full flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900">
              Complete Your Preferences
            </h3>
            <span className="text-sm font-bold text-yellow-700 bg-yellow-200 px-3 py-1 rounded-full">
              {completionPercentage}% Complete
            </span>
          </div>
          
          <p className="text-gray-700 mb-4">
            Smart Pet Matching works best when you complete your preferences. 
            This helps us find the perfect pet for your lifestyle!
          </p>
          
          {/* Progress checks */}
          <div className="space-y-3 mb-5">
            {checks.map((check, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {check.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${check.completed ? 'text-green-700' : 'text-gray-700'}`}>
                    {check.label}
                  </p>
                  <p className="text-sm text-gray-600">{check.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Action button */}
          <button 
            onClick={() => {
              navigate("/profile");
            }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Settings className="w-5 h-5" />
            Complete Preferences Now
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    orange: "bg-orange-100 text-orange-600",
    yellow: "bg-yellow-100 text-yellow-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className={`inline-flex p-3 rounded-lg mb-3 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-6 py-4 font-medium transition-colors ${
        active ? "bg-[#FF8C42] text-white" : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function OverviewTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-6 h-6 text-[#FF8C42]" />
        <h3 className="text-xl font-bold text-gray-900">Activity Summary</h3>
      </div>

      {data.stats.totalRequests === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            No adoption requests yet
          </h4>
          <p className="text-gray-500">
            Browse available pets and submit your first request!
          </p>
        </div>
      ) : (
        <>
          {/* Recent Requests */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Recent Requests
            </h4>
            <div className="space-y-2">
              {data.requests.slice(0, 3).map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        req.petId?.images?.[0]?.url ||
                        "https://via.placeholder.com/50"
                      }
                      alt={req.petId?.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {req.petId?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(req.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Adopted Pets */}
          {data.adoptedPets.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Your Adopted Pets
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.adoptedPets.map((item, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={
                        item.petId?.images?.[0]?.url ||
                        "https://via.placeholder.com/200"
                      }
                      alt={item.petId?.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h5 className="font-semibold text-gray-900">
                      {item.petId?.name}
                    </h5>
                    <p className="text-sm text-gray-500">
                      Adopted:{" "}
                      {new Date(item.adoptionDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RequestsTab({ requests, onRefresh, adopterId }) {
  const cancelRequest = async (petId) => {
    if (!window.confirm("Cancel this request?")) return;

    await fetch(
      `http://localhost:5000/api/adopters/${adopterId}/request/${petId}`,
      { method: "DELETE" }
    );

    onRefresh();
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No requests submitted yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-4">
            <img
              src={
                req.petId?.images?.[0]?.url || "https://via.placeholder.com/80"
              }
              alt={req.petId?.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">
                {req.petId?.name || "Unknown Pet"}
              </h4>
              <p className="text-sm text-gray-600">
                {req.petId?.species} • {req.petId?.breed}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Submitted: {new Date(req.requestDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={req.status} />
            {req.status === "Pending" && (
              <button
                onClick={() => cancelRequest(req.petId._id)}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdoptedPetsTab({ pets }) {
  if (pets.length === 0) {
    return (
      <div className="text-center py-12">
        <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No adopted pets yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((item, idx) => (
        <div
          key={idx}
          className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
        >
          <img
            src={
              item.petId?.images?.[0]?.url || "https://via.placeholder.com/400"
            }
            alt={item.petId?.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {item.petId?.name}
            </h4>
            <p className="text-gray-600 mb-3">
              {item.petId?.species} • {item.petId?.size}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>
                Adopted: {new Date(item.adoptionDate).toLocaleDateString()}
              </span>
            </div>
            <button className="w-full bg-[#FF8C42] hover:bg-[#e67e3b] text-white font-medium py-2 rounded-lg transition-colors">
              View Care Plan
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Approved: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded-full border ${styles[status]}`}
    >
      {status}
    </span>
  );
}