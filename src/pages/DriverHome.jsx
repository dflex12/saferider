// src/pages/DriverHome.jsx
import React, { useState, useEffect } from 'react';
import { 
  startDriverGPSBroadcasting, 
  stopDriverGPSBroadcasting, 
  updateStudentTripStatus 
} from '../services/liveTracking';

export default function DriverHome({ driverId = "DRV_101", tripId = "TRIP_TODAY" }) {
  const [isTripActive, setIsTripActive] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [students, setStudents] = useState([
    { id: "STU_1", name: "Aarav Patel", school: "RNG Public School", status: "waiting" },
    { id: "STU_2", name: "Ananya Sharma", school: "RNG Public School", status: "waiting" }
  ]);

  const handleToggleTrip = () => {
    if (!isTripActive) {
      const id = startDriverGPSBroadcasting(driverId, tripId);
      setWatchId(id);
      setIsTripActive(true);
    } else {
      stopDriverGPSBroadcasting(watchId);
      setWatchId(null);
      setIsTripActive(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    updateStudentTripStatus(tripId, studentId, newStatus);
    setStudents(prev =>
      prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s)
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-50 min-h-screen">
      <header className="bg-blue-600 text-white p-4 rounded-lg shadow-md mb-4">
        <h1 className="text-xl font-bold">Safe Ride Driver Portal</h1>
        <p className="text-sm">Route: Morning Pickup #4</p>
      </header>

      <div className="bg-white p-4 rounded-lg shadow mb-6 text-center">
        <button
          onClick={handleToggleTrip}
          className={`w-full py-3 text-lg font-semibold rounded-md transition ${
            isTripActive ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {isTripActive ? 'End Active Trip' : 'Start Trip & Share GPS'}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          {isTripActive ? '🟢 Live GPS Broadcasting Active' : '🔴 Trip Inactive'}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold text-gray-700 mb-3">Student Onboard Manifest</h2>
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-semibold text-gray-800">{student.name}</p>
              <p className="text-xs text-gray-500">{student.school}</p>
            </div>
            <select
              value={student.status}
              onChange={(e) => handleStatusChange(student.id, e.target.value)}
              className="text-sm p-1 border rounded bg-gray-50"
            >
              <option value="waiting">Waiting</option>
              <option value="picked_up">Onboarded</option>
              <option value="dropped">Dropped Off</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}