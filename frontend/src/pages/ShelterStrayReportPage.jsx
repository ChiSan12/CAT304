import { useEffect, useState } from "react";
import ShelterLayout from "../components/ShelterLayout";
import { useAuth } from "../context/AuthContext";
import { Heart, MapPin, Trash2, User, XCircle } from "lucide-react";

export default function ShelterStrayReportPage() {
  const { user } = useAuth();
  const SHELTER_ID = user?.id;

  const [strays, setStrays] = useState([]);
  const [rescueModal, setRescueModal] = useState({ show: false, report: null });
  const [rescueForm, setRescueForm] = useState({
    name: "",
    breed: "",
    ageYears: "",
    ageMonths: "",
    gender: "Male",
  });

  const fetchStrays = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reports`);
      const data = await res.json();
      if (data.success) setStrays(data.reports);
    } catch (err) {
      console.error(err);
    }
  };

  // --- REFRESH FUNCTION ---
  const refreshData = () => {
    fetchStrays();
  };

  const handleStatusUpdate = async (id, status) => {
    await fetch(`http://localhost:5000/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refreshData();
  };

  const openRescueModal = (report) => {
    setRescueForm({
      name: "",
      breed: "",
      ageYears: "0",
      ageMonths: "0",
      gender: "Male",
    });
    setRescueModal({ show: true, report });
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    await fetch(`http://localhost:5000/api/reports/${id}`, {
      method: "DELETE",
    });
    refreshData();
  };

  const submitRescue = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:5000/api/reports/${rescueModal.report._id}/rescue`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...rescueForm, shelterId: SHELTER_ID }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Pet Rescued and Added to Listings!");
        setRescueModal({ show: false, report: null });
        refreshData();
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (SHELTER_ID) refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SHELTER_ID]);

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
            Public Stray Reports
          </h1>
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
                  <th className="p-4 text-gray-600 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {strays.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-500">
                      No stray reports found.
                    </td>
                  </tr>
                ) : (
                  strays.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {r.image ? (
                            <img
                              src={r.image}
                              className="w-10 h-10 rounded object-cover border"
                              alt="Stray"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">
                              No Img
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">
                              {r.animalType}
                            </div>
                            <div className="text-xs text-gray-500">
                              {r.condition} • {r.number} Found
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ADDED REPORTER COLUMN */}
                      <td className="p-4">
                        <div className="flex items-start gap-2">
                          <User size={16} className="mt-1 text-gray-400" />
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {r.reportedBy?.fullName || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {r.reportedBy?.email}
                            </div>
                            {r.reportedBy?.phone && (
                              <div className="text-xs text-gray-500">
                                {r.reportedBy.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td
                        className="p-4 max-w-xs truncate text-sm"
                        title={r.placeDesc}
                      >
                        {r.placeDesc}
                        <a
                          href={`https://www.google.com/maps/place/${r.pin?.lat},${r.pin?.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs text-blue-500 hover:underline mt-1 flex items-center gap-1"
                        >
                          <MapPin size={10} /> View Map
                        </a>
                      </td>
                      <td className="p-4">
                        <select
                          value={r.status}
                          onChange={(e) =>
                            handleStatusUpdate(r._id, e.target.value)
                          }
                          className={`text-xs font-bold px-2 py-1 rounded-full border outline-none cursor-pointer ${
                            r.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : r.status === "Rescued"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Investigating">Investigating</option>
                          <option value="Rescued">Rescued</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {r.status === "Pending" && (
                          <button
                            onClick={() => openRescueModal(r)}
                            className="bg-[#FF8C42] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600 flex items-center gap-1 shadow-sm"
                          >
                            <Heart size={12} className="fill-current" /> Rescue
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReport(r._id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {rescueModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="bg-orange-500 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Heart className="fill-current" size={18} /> Rescue & Create Pet
              </h3>
              <button
                onClick={() => setRescueModal({ show: false, report: null })}
              >
                <XCircle size={24} className="hover:text-gray-200" />
              </button>
            </div>
            <form onSubmit={submitRescue} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded">
                This will create a new pet listing using the photo and details
                from the stray report.
              </p>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Pet Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full border rounded p-2 mt-1 focus:ring-2 focus:ring-orange-200 outline-none"
                  value={rescueForm.name}
                  onChange={(e) =>
                    setRescueForm({ ...rescueForm, name: e.target.value })
                  }
                  placeholder="e.g. Buddy"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Breed
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 mt-1"
                    value={rescueForm.breed}
                    onChange={(e) =>
                      setRescueForm({ ...rescueForm, breed: e.target.value })
                    }
                    placeholder="Mix"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Gender
                  </label>
                  <select
                    className="w-full border rounded p-2 mt-1"
                    value={rescueForm.gender}
                    onChange={(e) =>
                      setRescueForm({ ...rescueForm, gender: e.target.value })
                    }
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded p-2 mt-1"
                    value={rescueForm.ageYears}
                    onChange={(e) =>
                      setRescueForm({ ...rescueForm, ageYears: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Age (Months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    className="w-full border rounded p-2 mt-1"
                    value={rescueForm.ageMonths}
                    onChange={(e) =>
                      setRescueForm({
                        ...rescueForm,
                        ageMonths: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 shadow-md"
              >
                Confirm Rescue
              </button>
            </form>
          </div>
        </div>
      )}
    </ShelterLayout>
  );
}
