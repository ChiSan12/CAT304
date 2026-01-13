import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function HomeCareReminderPreview() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:5000/api/reminders/preview/${user.id}`)
      .then(res => res.json())
      .then(data => {
        console.log("PREVIEW REMINDERS:", data.reminders);

        setReminders(data.reminders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <p className="text-sm text-gray-400 text-center">
        Loading reminders…
      </p>
    );
  }

  return (
    <div className="mt-6 max-h-72 overflow-y-auto space-y-3 pr-2">

      {reminders.length === 0 && (
        <p className="text-sm text-gray-400 text-center">
          🩺 No upcoming care reminders
        </p>
      )}

      {reminders.map(r => {
        const overdue = new Date(r.dueDate) < new Date();

        return (
          <div
            key={r._id}
            className={`p-4 rounded-xl border
              ${overdue
                ? "bg-red-50 border-red-200"
                : "bg-orange-50 border-orange-200"}
            `}
          >
            
            <h4 className="text-sm font-semibold text-gray-800">
              {r.title}
            </h4>

            <p className="text-xs mt-1 text-gray-600">
                <span className="font-semibold text-gray-700">
                    {r.petId && (
                        <span className="font-semibold text-gray-700">
                          🐾 {r.petId.name}
                        </span>
                    )}
                </span>
                {" • "}
                Due {new Date(r.dueDate).toLocaleDateString()}
            </p>

            <div className="flex justify-end mt-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold
                  ${overdue
                    ? "bg-red-100 text-red-600"
                    : "bg-orange-100 text-orange-600"}
                `}
              >
                {overdue ? "Overdue" : "Upcoming"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
