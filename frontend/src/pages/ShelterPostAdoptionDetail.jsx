import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import ShelterLayout from "../components/ShelterLayout";
import CareReminderList from '../components/CareReminderList';

export default function ShelterPostAdoptionDetail() {
  const { petId } = useParams();
  const { user } = useAuth(); 
  const shelterId = user?.id; 
  const [updates, setUpdates] = useState([]);

    useEffect(() => {
    // Fetch adopter updates
    fetch(`http://localhost:5000/api/pet-updates/pet/${petId}`)
        .then(res => res.json())
        .then(data => setUpdates(data.updates || []));
    }, [petId]);

  return (
    <ShelterLayout>
      <div className="flex-1 p-8 ml-64 space-y-10">
        <h1 className="text-3xl font-bold">Post-Adoption Timeline</h1>

        {/* REMINDERS */}
        <section>
          <h2 className="font-semibold mb-4">Care Reminders</h2>
          {/* USE SHARED COMPONENT WITH ROLE */}
          <CareReminderList
            petId={petId}
            shelterId={shelterId}
            role="shelter"
          />
        </section>

        {/* 📸 UPDATES */}
        {/* <section>
          <h2 className="font-semibold mb-4">Adopter Updates</h2>
          {updates.map(u => (
            <UpdateCard key={u._id} u={u} />
          ))}
        </section>
      </div>
    </ShelterLayout>
  );
} */}

     {/* 📸 UPDATES */}
        <section>
          <h2 className="font-semibold mb-4">Adopter Updates</h2>
          
          {updates.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {updates.map(u => (
                <UpdateCard key={u._id} u={u} />
              ))}
            </div>
          )}
        </section>
      </div>
    </ShelterLayout>
  );
}

function EmptyState() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-lg p-12 text-center">
      <div className="max-w-md mx-auto">
        <svg className="w-10 h-10 text-blue-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-base font-semibold text-gray-800 mb-2">No Updates Yet</h3>
        <p className="text-sm text-gray-600 mb-6">
          The adopter hasn't shared any updates about their pet yet. 
        </p>
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-700 mb-2">
            Encourage adopters to share updates by sending a friendly care reminder message
          </p>
        </div>
      </div>
    </div>
  );
}



function UpdateCard({ u }) {
  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <p className="text-sm mb-2">{u.notes}</p>
      <p className="text-xs text-gray-500">
        Condition: {u.condition}
      </p>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {u.images?.map((img, i) => (
          <img
            key={i}
            src={img.image}
            className="h-24 object-cover rounded"
            alt="pet update"
          />
        ))}
      </div>
    </div>
  );
}