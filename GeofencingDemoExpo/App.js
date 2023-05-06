import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getDistance } from 'geolib';

const GEOFENCING_TASK = 'GEOFENCING_TASK';

TaskManager.defineTask(GEOFENCING_TASK, ({ data: { eventType, region }, error }) => {
  if (error) {
    console.error('Geofencing error:', error);
    return;
  }

  if (eventType === Location.GeofencingEventType.Enter) {
    console.log(`Sie befinden sich in der Nähe der ${region.identifier}.`);
  } else if (eventType === Location.GeofencingEventType.Exit) {
    console.log(`Sie verlassen die ${region.identifier}.`);
  }
});

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [initialRegion, setInitialRegion] = useState(null);

  const regions = [
    {
      identifier: 'Hochschule München Campus Lothstraße',
      latitude: 48.154278,
      longitude: 11.553861,
      radius: 200,
      notifyOnEnter: true,
      notifyOnExit: true,
    },
    {
      identifier: 'Hochschule München Campus Karlstraße',
      latitude: 48.142878,
      longitude: 11.568263,
      radius: 80,
      notifyOnEnter: true,
      notifyOnExit: true,
    },
    {
      identifier: 'Hochschule München Campus Pasing',
      latitude: 48.141625,
      longitude: 11.451135,
      radius: 150,
      notifyOnEnter: true,
      notifyOnExit: true,
    },
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
  }, []);

  async function startMonitoring() {
    await Location.startGeofencingAsync(GEOFENCING_TASK, regions);
    setIsMonitoring(true);
  }

  async function stopMonitoring() {
    await Location.stopGeofencingAsync(GEOFENCING_TASK);
    setIsMonitoring(false);
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation={true}
        userLocationAnnotationTitle=""
      >
        {regions.map((region, index) => (
          <Circle
            key={index}
            center={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            radius={region.radius}
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
