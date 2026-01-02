import { useEffect, useState } from "react";
import ShelterLayout from "../components/ShelterLayout";

export default function ShelterPostAdoptionPage() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/shelters/adopted-pets")
      .then(res => res.json())
      .then(data => {
        if (data.success) setPets(data.pets);
      });
  }, []);

  return (
    <ShelterLayout>
      <div className="flex-1 p-8 ml-64">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Post-Adoption Monitoring
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pets.map(pet => (
            <PetCard key={pet._id} pet={pet} />
          ))}
        </div>
      </div>
    </ShelterLayout>
  );
}

function PetCard({ pet }) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <img
        src={pet.images?.[0]?.url}
        alt={pet.name}
        className="h-40 w-full object-cover rounded-lg mb-3"
      />
      <h3 className="font-semibold">{pet.name}</h3>
      <p className="text-sm text-gray-500">Adopted</p>

      <a
        href={`/admin/post-adoption/${pet._id}`}
        className="mt-3 inline-block text-orange-600 text-sm font-medium"
      >
        View Timeline →
      </a>
    </div>
  );
}