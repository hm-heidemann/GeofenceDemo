import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [insideGeofence, setInsideGeofence] = useState(false);
  const [location, setLocation] = useState(null);
  const positionSubscription = useRef(null);
  const mapRef = useRef(null);

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
        setLocation(location);
        console.log('Current location: ' + location.coords.latitude + ', ' + location.coords.longitude);
        const currentlyInsideGeofence = isInsideGeofence(location, hochschuleMuenchen);
        console.log('Inside geofence:', currentlyInsideGeofence);

        if (currentlyInsideGeofence !== insideGeofence) {
          setInsideGeofence(currentlyInsideGeofence);
        }

        if (mapRef.current) {
          mapRef.current.animateCamera({
            center: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          });
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
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: hochschuleMuenchen.latitude,
          longitude: hochschuleMuenchen.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        userLocationAnnotationTitle=""
      >
        <Circle
          center={{
            latitude: hochschuleMuenchen.latitude,
            longitude: hochschuleMuenchen.longitude,
          }}
          radius={hochschuleMuenchen.radius}
          strokeWidth={1}
          strokeColor="#3399ff"
          fillColor="rgba(51, 153, 255, 0.1)"
        />
      </MapView>
      <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: isMonitoring ? 'red' : 'green',
            padding: 20,
            alignItems: 'center',
            borderRadius: 5,
          }}
          onPress={isMonitoring ? stopMonitoring : startMonitoring}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
