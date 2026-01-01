import React, { useEffect, useState } from 'react';

export default function CareReminderList({ petId, role = 'adopter' }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!petId) return;

    fetch(`http://localhost:5000/api/reminders/pet/${petId}`)
      .then(res => res.json())
      .then(data => {
        setReminders(data.reminders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load reminders', err);
        setLoading(false);
      });
  }, [petId]);

  const markCompleted = async (id) => {
    await fetch(`http://localhost:5000/api/reminders/${id}/complete`, {
      method: 'PUT',
    });

    setReminders(prev =>
      prev.map(r =>
        r._id === id
          ? { ...r, status: 'completed', completedAt: new Date() }
          : r
      )
    );
  };

  const getStatus = (reminder) => {
    if (reminder.status === 'completed') {
      return { text: 'Completed', style: 'bg-green-100 text-green-700' };
    }

    const daysLeft = Math.ceil(
      (new Date(reminder.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return { text: 'Overdue', style: 'bg-red-100 text-red-700' };
    }

    if (daysLeft <= 7) {
      return { text: 'Due Soon', style: 'bg-yellow-100 text-yellow-700' };
    }

    return { text: 'Upcoming', style: 'bg-blue-100 text-blue-700' };
  };

  if (loading) {
    return <p className="text-gray-500">Loading reminders...</p>;
  }

  if (reminders.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No care reminders available for this pet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reminders.map(reminder => {
        const status = getStatus(reminder);

        return (
          <div
            key={reminder._id}
            className="bg-white border rounded-xl p-5 shadow-sm"
          >
            {/* Header row */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-800">
                  {reminder.title}
                </h4>

                <p className="text-sm text-gray-500">
                  Due on {new Date(reminder.dueDate).toLocaleDateString()}
                </p>

                {reminder.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    📝 {reminder.notes}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  Created by {reminder.createdBy === 'system' ? 'System' : 'Shelter'}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${status.style}`}
              >
                {status.text}
              </span>
            </div>

            {/* Action */}
            {reminder.status !== 'completed' && role === 'adopter' && (
              <button
                onClick={() => markCompleted(reminder._id)}
                className="mt-4 px-4 py-2 text-sm rounded-lg bg-[#FF8C42] text-white hover:bg-[#e67e3b]"
              >
                Mark as Completed
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}