import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
// import * as Notifications from 'expo-notifications';

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeGeofences, setActiveGeofences] = useState([]);
  const [location, setLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const positionSubscription = useRef(null);
  const mapRef = useRef(null);

 // Hier Geofences eintragen
  const geofences = [
    {
      name: 'Hochschule München Campus Lothstraße',
      latitude: 48.154278,
      longitude: 11.553861,
      radius: 200,
    }, {
      name: 'Hochschule München Campus Karlstraße',
      latitude: 48.142878,
      longitude: 11.568263,
      radius: 80,
    }, {
      name: 'Hochschule München Campus Pasing',
      latitude: 48.141625,
      longitude: 11.451135,
      radius: 150,
    }
  ];

  // Abfrage der Tracking Berechtigungen & Setze initale Location
  useEffect(() => {
    (async () => {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      // const { status } = await Notifications.requestPermissionsAsync();

      if (fgStatus !== 'granted' || bgStatus !== 'granted') {
        console.log('Eine oder mehrere Permissions wurden nicht erteilt.');
        return;
      }

      const initialUserLocation = await Location.getCurrentPositionAsync({});
      setInitialRegion({
        latitude: initialUserLocation.coords.latitude,
        longitude: initialUserLocation.coords.longitude,
         latitudeDelta: 0.005,
         longitudeDelta: 0.005,
      });
    })();

    return () => {
      if (positionSubscription.current) {
        positionSubscription.current.remove();
      }
    };
  }, []);

  // Berechne ob man sich in einem Geofence befindet
  function isInsideGeofence(location, geofence) {
    const { latitude, longitude, radius } = geofence;
    const distance = getDistance(
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
      { latitude, longitude }
    );
    return distance <= radius;
  }

  // Diesen Teil auskommentieren, falls man Notifications versenden möchte

  // async function sendEnterNotification(geofenceName) {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: 'Geofence',
  //       body: `Sie befinden sich in der Nähe der ${geofence.name}.`,
  //     },
  //     trigger: null,
  //   });
  // }

  // async function sendExitNotification(geofenceName) {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: 'Geofence',
  //       body: `Sie verlassen die ${geofence.name}.`,
  //     },
  //     trigger: null,
  //   });
  // }


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

        // Zentriere Karte auf aktuelle Position
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
    setActiveGeofences([]);
  }


  useEffect(() => {
    if (!location) {
      return;
    }

    activeGeofences.forEach((name) => {
      const geofence = geofences.find((geofence) => geofence.name === name);
      if (geofence && !isInsideGeofence(location, geofence)) {
        // sendEnterNotification(geofence.name);
        console.log(`Sie verlassen die ${geofence.name}.`);
        setActiveGeofences((prev) => prev.filter((activeName) => activeName !== geofence.name));
      }
    });

    geofences.forEach((geofence) => {
      if (isInsideGeofence(location, geofence) && !activeGeofences.includes(geofence.name)) {
        // sendExitNotification(geofence.name);
        console.log(`Sie befinden sich in der Nähe der ${geofence.name}.`);
        setActiveGeofences((prev) => [...prev, geofence.name]);
      }
    });
  }, [location, activeGeofences]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation={true}
        userLocationAnnotationTitle=""
      >
        {geofences.map((geofence, index) => (
          <Circle
            key={index}
            center={{
              latitude: geofence.latitude,
              longitude: geofence.longitude,
            }}
            radius={geofence.radius}
            strokeWidth={1}
            strokeColor="#3399ff"
            fillColor="rgba(51, 153, 255, 0.1)"
          />
        ))}
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
