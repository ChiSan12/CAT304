import { useEffect, useState } from "react";
import ShelterLayout from "../components/ShelterLayout";
import { useAuth } from "../context/AuthContext";

export default function ShelterSettingPage() {
  const { user } = useAuth();
  const SHELTER_ID = user?.id;

  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    location: { address: "", city: "", state: "" },
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/shelters/${SHELTER_ID}`
      );
      const data = await res.json();
      if (data.success && data.shelter) {
        setProfile({
          ...data.shelter,
          location: data.shelter.location || {
            address: "",
            city: "",
            state: "",
          },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- REFRESH FUNCTION ---
  const refreshData = () => {
    fetchProfile();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await fetch(`http://localhost:5000/api/shelters/${SHELTER_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      alert("Profile updated!");
    } catch (err) {
      alert("Update failed");
    }
    setProfileLoading(false);
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
            Shelter Settings
          </h1>
          <form
            onSubmit={handleUpdateProfile}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6"
          >
            <div>
              <label className="block text-sm font-bold mb-2">
                Shelter Name
              </label>
              <input
                className="w-full p-3 border rounded-xl"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Contact Phone
              </label>
              <input
                className="w-full p-3 border rounded-xl"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">City</label>
                <input
                  className="w-full p-3 border rounded-xl"
                  value={profile.location?.city || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      location: { ...profile.location, city: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">State</label>
                <input
                  className="w-full p-3 border rounded-xl"
                  value={profile.location?.state || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      location: {
                        ...profile.location,
                        state: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Address</label>
              <textarea
                className="w-full p-3 border rounded-xl"
                rows="3"
                value={profile.location?.address || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: {
                      ...profile.location,
                      address: e.target.value,
                    },
                  })
                }
              />
            </div>
            <button
              disabled={profileLoading}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 shadow-lg"
            >
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </ShelterLayout>
  );
}
