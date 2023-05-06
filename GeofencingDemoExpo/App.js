import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [insideGeofence, setInsideGeofence] = useState(false);
  const positionSubscription = useRef(null);

  const hochschuleMuenchen = {
    latitude: 48.154278,
    longitude: 11.553861,
    radius: 200,
  };

  useEffect(() => {
    (async () => {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

      if (fgStatus !== 'granted' || bgStatus !== 'granted') {
        console.log('Eine oder mehrere Permissions wurden nicht erteilt.');
        return;
      }
    })();

    return () => {
      if (positionSubscription.current) {
        positionSubscription.current.remove();
      }
    };
  }, []);

  function isInsideGeofence(location, geofence) {
    const { latitude, longitude, radius } = geofence;
    const distance = getDistance(
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
      { latitude, longitude }
    );
    return distance <= radius;
  }

  async function startMonitoring() {
    positionSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 10,
      },
      (location) => {
        console.log('Current location: ' + location.coords.latitude + ', ' + location.coords.longitude);
        const currentlyInsideGeofence = isInsideGeofence(location, hochschuleMuenchen);
        console.log('Inside geofence:', currentlyInsideGeofence);

        if (currentlyInsideGeofence !== insideGeofence) {
          setInsideGeofence(currentlyInsideGeofence);
        }
      }
    );

    setIsMonitoring(true);
  }

  async function stopMonitoring() {
    if (positionSubscription.current) {
      positionSubscription.current.remove();
    }
    setIsMonitoring(false);
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Geofencing Demo App</Text>
      <TouchableOpacity
        onPress={isMonitoring ? stopMonitoring : startMonitoring}
        style={{
          backgroundColor: isMonitoring ? 'red' : 'blue',
          padding: 10,
          borderRadius: 5,
          marginTop: 20,
        }}
      >
        <Text style={{ color: 'white' }}>
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
