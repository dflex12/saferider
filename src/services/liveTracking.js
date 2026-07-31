// src/services/liveTracking.js
import { db } from './firebase';
import { ref, set, onValue, off, update } from 'firebase/database';

// Calculate distance in kilometers using the Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

// Estimate ETA in minutes assuming local traffic average speed (approx 25 km/h)
export function calculateETAInMinutes(distanceKm, averageSpeedKmH = 25) {
  if (distanceKm <= 0) return 0;
  return Math.round((distanceKm / averageSpeedKmH) * 60);
}

// DRIVER: Start active location broadcasting
export function startDriverGPSBroadcasting(driverId, tripId) {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser/device.");
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, speed, heading } = position.coords;
      const tripRef = ref(db, `trips/${tripId}/liveLocation`);
      
      set(tripRef, {
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || 0,
        updatedAt: Date.now()
      });
    },
    (error) => console.error("GPS Tracking Error:", error),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );

  return watchId;
}

// DRIVER: Stop active location broadcasting
export function stopDriverGPSBroadcasting(watchId) {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
}

// DRIVER: Update student status (e.g. Picked Up, Dropped)
export function updateStudentTripStatus(tripId, studentId, status) {
  const statusRef = ref(db, `trips/${tripId}/students/${studentId}`);
  update(statusRef, {
    status: status, // 'waiting' | 'picked_up' | 'dropped'
    timestamp: Date.now()
  });
}

// PARENT: Listen to live driver location & trigger proximity alerts
export function subscribeToTripUpdates(tripId, parentHomeCoords, onLocationUpdate, onProximityAlert) {
  const tripRef = ref(db, `trips/${tripId}`);
  let alertTriggered = false;

  const unsubscribe = onValue(tripRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const liveLoc = data.liveLocation;
    if (liveLoc) {
      const distance = calculateDistance(
        liveLoc.latitude,
        liveLoc.longitude,
        parentHomeCoords.latitude,
        parentHomeCoords.longitude
      );
      const eta = calculateETAInMinutes(distance);

      // Trigger 10-minute alert once per trip
      if (eta <= 10 && eta > 1 && !alertTriggered) {
        alertTriggered = true;
        if (onProximityAlert) onProximityAlert(eta, distance);
      }

      if (onLocationUpdate) {
        onLocationUpdate({
          location: liveLoc,
          students: data.students || {},
          distanceKm: distance.toFixed(2),
          etaMinutes: eta
        });
      }
    }
  });

  return () => off(tripRef);
}