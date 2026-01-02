import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

export default function MyReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  const loadReports = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/reports?userId=${user.id}`);
      const data = await res.json();

      if (data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error("Fetch Reports Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Summary counts ---
  const totalReports = reports.length;
  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const investigatingCount = reports.filter(r => r.status === "Investigating").length;
  const rescuedCount = reports.filter(r => r.status === "Rescued").length;
  const rejectedCount = reports.filter(r => r.status === "Rejected").length;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header Section */}
      <section className="relative bg-white border-b-4 border-orange-400">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              My Reports
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track all your stray animal reports and their rescue status in one place
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <StatCard 
            icon="📋" 
            label="Total Reports" 
            value={totalReports} 
            bgColor="bg-white"
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            valueColor="text-gray-900"
          />
          <StatCard 
            icon="⏳" 
            label="Pending" 
            value={pendingCount} 
            bgColor="bg-white"
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
            valueColor="text-gray-900"
          />
          <StatCard 
            icon="🔍" 
            label="Investigating" 
            value={investigatingCount} 
            bgColor="bg-white"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            valueColor="text-gray-900"
          />
          <StatCard 
            icon="✅" 
            label="Rescued" 
            value={rescuedCount} 
            bgColor="bg-white"
            iconBg="bg-green-100"
            iconColor="text-green-600"
            valueColor="text-gray-900"
          />
          <StatCard 
            icon="❌" 
            label="Rejected" 
            value={rejectedCount} 
            bgColor="bg-white"
            iconBg="bg-red-100"
            iconColor="text-red-600"
            valueColor="text-gray-900"
          />
        </div>

        {/* Reports Section Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">All Reports</h2>
          <p className="text-gray-600 mt-2">Complete history of your submissions</p>
        </div>

        {/* Reports Table */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reports Yet</h3>
            <p className="text-gray-600">You haven't submitted any stray animal reports.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-center">
                <thead className="bg-orange-50 border-b-2 border-orange-200">
                    <tr>
                    <th className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wider">
                        #
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Photo
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Animal Type
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Condition
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Description
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Place
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Status
                    </th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wider">
                        Date & Time
                    </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {reports.map((r, idx) => (
                    <tr key={r._id} className="hover:bg-orange-50 transition-colors text-center">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{idx + 1}</td>
                        <td className="px-6 py-4">
                        {r.image ? (
                            <img
                            src={r.image}
                            alt={r.animalType}
                            className="w-24 h-24 object-cover rounded-xl shadow-sm mx-auto"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 mx-auto">
                            <span className="text-2xl">🐾</span>
                            <span className="text-xs mt-1">No Photo</span>
                            </div>
                        )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.animalType}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.condition}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{r.animalDesc}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{r.placeDesc}</td>
                        <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                        {r.createdAt
                            ? new Date(r.createdAt).toLocaleString("en-MY", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "-"}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== Components ===================== */
function StatCard({ icon, label, value, bgColor, iconBg, iconColor, valueColor }) {
  return (
    <div className={`${bgColor} rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all`}>
      <div className={`inline-flex p-3 rounded-xl mb-4 ${iconBg}`}>
        <span className={`text-3xl ${iconColor}`}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${valueColor} mb-1`}>{value}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-300",
      icon: "⏳"
    },
    Investigating: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
      icon: "🔍"
    },
    Rescued: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
      icon: "✅"
    },
    Rejected: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-300",
      icon: "❌"
    },
  };

  // Fallback to Pending if unknown status
  const style = styles[status] || styles.Pending;

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-2 ${style.bg} ${style.text} ${style.border}`}
    >
      <span>{style.icon}</span>
      {status}
    </span>
  );
}
