import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ShelterLayout from "../components/ShelterLayout";

export default function ShelterPostAdoptionDetail() {
  const { petId } = useParams();
  const [updates, setUpdates] = useState([]);
  const [reminders, setReminders] = useState([]);

    useEffect(() => {
    // Fetch adopter updates
    fetch(`http://localhost:5000/api/pet-updates/pet/${petId}`)
        .then(res => res.json())
        .then(data => setUpdates(data.updates || []));

    // Fetch care reminders
    fetch(`http://localhost:5000/api/reminders/pet/${petId}`)
        .then(res => res.json())
        .then(data => setReminders(data.reminders || []));
    }, [petId]);

  return (
    <ShelterLayout>
      <div className="flex-1 p-8 ml-64 space-y-10">
        <h1 className="text-2xl font-bold">Post-Adoption Timeline</h1>

        {/* 🔔 REMINDERS */}
        <section>
          <h2 className="font-semibold mb-4">Care Reminders</h2>
          {reminders.map(r => (
            <ReminderCard key={r._id} r={r} />
          ))}
        </section>

        {/* 📸 UPDATES */}
        <section>
          <h2 className="font-semibold mb-4">Adopter Updates</h2>
          {updates.map(u => (
            <UpdateCard key={u._id} u={u} />
          ))}
        </section>
      </div>
    </ShelterLayout>
  );
}

function ReminderCard({ r }) {
  return (
    <div className="bg-white border rounded-lg p-4 mb-3">
      <h4 className="font-medium">{r.title}</h4>
      <p className="text-sm text-gray-500">
        Due: {new Date(r.dueDate).toLocaleDateString()}
      </p>
      <span className="text-xs text-orange-600">{r.status}</span>
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