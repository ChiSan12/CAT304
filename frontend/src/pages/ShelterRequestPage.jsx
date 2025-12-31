import { useEffect, useState } from "react";
import ShelterLayout from "../components/ShelterLayout";
import { useAuth } from "../context/AuthContext";

export default function ShelterRequestPage() {
  const { user } = useAuth();
  const SHELTER_ID = user?.id;
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/shelters/${SHELTER_ID}/requests`
      );
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (err) {
      console.error(err);
    }
  };

  // --- REFRESH FUNCTION ---
  const refreshData = () => {
    fetchRequests();
  };

  const handleRequestAction = async (requestId, action) => {

  if (action === "approve" && !window.confirm("Approve this request?")) return;
  if (action === "reject" && !window.confirm("Reject this request?")) return;
  
  try {
    const res = await fetch(
      `http://localhost:5000/api/shelters/${SHELTER_ID}/requests/${requestId}/${action}`,
      {
        method: "PATCH",
      }
    );

    const data = await res.json();
    if (!data.success) {
      alert(data.message || "Action failed");
      return;
    }

    refreshData();
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
            Adoption Requests
          </h1>
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
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      No pending requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr
                      key={req.requestId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={req.petImage}
                          className="w-8 h-8 rounded-full object-cover"
                          alt="Pet"
                        />
                        <span className="font-medium">{req.petName}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {req.adopterName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {req.adopterEmail}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            req.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : req.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {req.status === "Pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleRequestAction(req.requestId, "approve")}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleRequestAction(req.requestId, "reject")}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ShelterLayout>
  );
}
