// src/components/ParentMapCard.jsx
import React, { useEffect, useState } from 'react';
import { subscribeToTripUpdates } from '../services/liveTracking';

export default function ParentMapCard({ 
  tripId = "TRIP_TODAY", 
  studentId = "STU_1",
  parentHomeCoords = { latitude: 21.1234, longitude: 73.1122 } 
}) {
  const [liveData, setLiveData] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  useEffect(() => {
    // Request Notification permission on load
    if (Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const unsubscribe = subscribeToTripUpdates(
      tripId,
      parentHomeCoords,
      (update) => setLiveData(update),
      (eta, distance) => {
        const msg = `⚠️ Alert: Your driver is approximately ${eta} minutes away (${distance} km)!`;
        setAlertMessage(msg);
        
        // Browser / Phone Native Notification
        if (Notification.permission === "granted") {
          new Notification("Safe Ride Proximity Alert", { body: msg });
        }
      }
    );

    return () => unsubscribe();
  }, [tripId]);

  const studentStatus = liveData?.students[studentId]?.status || "waiting";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-md mx-auto my-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800 text-lg">Live Van Location</h3>
        <span className={`px-2 py-1 text-xs rounded-full font-bold ${
          studentStatus === 'picked_up' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {studentStatus === 'picked_up' ? 'Child Onboard' : 'Waiting for Pickup'}
        </span>
      </div>

      {alertMessage && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-3 mb-3 text-sm rounded">
          {alertMessage}
        </div>
      )}

      {liveData ? (
        <div className="space-y-2">
          <div className="bg-blue-50 p-3 rounded-md flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Distance to Home</p>
              <p className="font-bold text-blue-900">{liveData.distanceKm} km</p>
            </div>
            <div>
              <p className="text-gray-500">Estimated Arrival</p>
              <p className="font-bold text-blue-900">~{liveData.etaMinutes} mins</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Lat: {liveData.location.latitude.toFixed(4)} | Lon: {liveData.location.longitude.toFixed(4)}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-6">
          Waiting for driver to start the trip...
        </p>
      )}
    </div>
  );
}