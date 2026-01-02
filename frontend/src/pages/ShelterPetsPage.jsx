import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AddPetModal from "../components/AddPetModal";
import EditPetModal from "../components/EditPetModal";
import ShelterLayout from "../components/ShelterLayout";

export default function ShelterPetsPage() {
  const { user } = useAuth();
  const SHELTER_ID = user?.id;
  const [pets, setPets] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);

  // --- API FUNCTIONS ---
  const fetchPets = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/shelters/${SHELTER_ID}/pets`
      );
      const data = await res.json();
      if (data.success) setPets(data.pets);
    } catch (err) {
      console.error(err);
    }
  };

  // --- REFRESH FUNCTION ---
  const refreshData = () => {
    fetchPets();
  };

  // --- ACTIONS ---
  const handleDeletePet = async (petId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await fetch(`http://localhost:5000/api/shelters/pets/${petId}`, {
        method: "DELETE",
      });
      refreshData();
    } catch (err) {
      alert("Error deleting pet");
    }
  };

  useEffect(() => {
    if (SHELTER_ID) refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SHELTER_ID]);

  return (
    <ShelterLayout>
      <div className="flex-1 p-8 ml-64">
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Pets</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 shadow-lg"
            >
              <Plus size={20} /> Add New Pet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={
                      pet.images?.[0]?.url || "https://via.placeholder.com/300"
                    }
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    alt={pet.name}
                  />
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-md text-white ${
                      pet.adoptionStatus === "Available"
                        ? "bg-green-500"
                        : pet.adoptionStatus === "Adopted"
                          ? "bg-gray-500"
                          : "bg-yellow-500"
                    }`}
                  >
                    {pet.adoptionStatus}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {pet.breed || "Unknown"} • {pet.age?.years} yrs{" "}
                  {pet.age?.months} mos
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPet(pet)}
                    className="flex-1 bg-gray-50 py-2 rounded-lg flex justify-center gap-2 hover:bg-gray-100 text-gray-700"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeletePet(pet._id)}
                    className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AddPetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={refreshData}
        shelterId={SHELTER_ID}
      />
      <EditPetModal
        isOpen={!!editingPet}
        onClose={() => setEditingPet(null)}
        onSave={refreshData}
        pet={editingPet}
      />
    </ShelterLayout>
  );
}
