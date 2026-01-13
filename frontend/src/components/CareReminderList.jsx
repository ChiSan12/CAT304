import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; 

export default function CareReminderList({ petId, shelterId, adopterId, role = 'adopter' }) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

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
          ? { ...r, status: 'Completed', completedAt: new Date() }
          : r
      )
    );
  };
  const handleCreateReminder = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reminders/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,         
          shelterId,
          title,
          dueDate,
          category: 'Health Check', 
          notes
        })
      });

    const data = await res.json();

    if (data.success) {
      setReminders(prev => [...prev, data.reminder]);
      setShowForm(false);
      setTitle('');
      setDueDate('');
      setNotes('');
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error('Create reminder failed:', err);
  }
};

  const getStatus = (reminder) => {
    if (reminder.status === 'Completed') {
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
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm">
          🩺 No care reminders available for this pet yet.
        </p>
      </div>
    );
  }

  const deleteReminder = async (id) => {
    await fetch(`http://localhost:5000/api/reminders/${id}`, {
      method: 'DELETE'
    });

    setReminders(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div className="space-y-4">
      {role === 'shelter' && (
        <button
          className="mb-4 px-4 py-2 text-sm rounded-lg bg-[#FF8C42] text-white"
          onClick={() => setShowForm(true)}
        >
          + Add Care Reminder
        </button>
      )}

      {/* manual reminder form */}
      {role === 'shelter' && showForm && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <input
            className="border p-2 w-full mb-3"
            placeholder="Reminder title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 w-full mb-3"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />

          {/* <textarea
            className="border p-2 w-full mb-3"
            placeholder="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          /> */}

          <button
            onClick={handleCreateReminder}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Save Reminder
          </button>
        </div>
      )}

      {reminders.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-sm">
            🩺 No care reminders available for this pet yet.
          </p>
        </div>
      )}

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
            {reminder.status !== 'Completed' && role === 'adopter' && (
              <button
                onClick={() => markCompleted(reminder._id)}
                className="mt-4 px-4 py-2 text-sm rounded-lg bg-[#FF8C42] text-white hover:bg-[#e67e3b]"
              >
                Mark as Completed
              </button>
            )}
            {role === 'shelter' && (
              <button
                onClick={() => deleteReminder(reminder._id)}
                className="text-xs text-red-500 hover:text-red-700 mt-2"
              >
                🗑 Delete
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}