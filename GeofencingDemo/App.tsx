import React, { Component } from 'react';
import { View, Text, TouchableOpacity, PermissionsAndroid, Platform, Button } from 'react-native';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import RNSimpleNativeGeofencing from '@shehang/react-native-simple-native-geofencing';

async function requestLocationPermission() {
  console.log("Inside requestLocationPermission()");
  try {
    const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

    if (status === RESULTS.GRANTED) {
      console.log('Location permission granted');
      // Berechtigung bereits erteilt
      // Starten Sie hier das Geofencing
    } else if (status === RESULTS.DENIED) {
      // Berechtigung abgelehnt, aber Benutzer kann sie noch ändern
      const newStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

      if (newStatus === RESULTS.GRANTED) {
        console.log('Location permission granted');
        // Berechtigung erteilt
        // Starten Sie hier das Geofencing
      } else {
        // Berechtigung weiterhin abgelehnt
        console.log('Location permission denied');
      }
    } else if (status === RESULTS.BLOCKED) {
      // Berechtigung abgelehnt und Benutzer kann sie nicht ändern (z.B. durch Elternkontrolle)
      console.log('Location permission blocked');
    }
  } catch (error) {
    console.log('Error while checking location permission:', error);
  }
}

/* async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Location permission',
          'message': 'Needed obviously'
        }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Granted Permission")
    } else {
      console.log("Denied Permission")
    }
  } catch (err) {
    console.warn(err)
  }
}; */

export default class App extends Component {

  componentDidMount() {

    if(Platform.OS === 'android'){
        requestLocationPermission();
    }

    RNSimpleNativeGeofencing.initNotification(
        {
          channel: {
            title: "Message Channel Title",
            description: "Message Channel Description"
          },
          start: {
            notify: true,
            title: "Start Tracking",
            description: "You are now tracked"
          },
          stop: {
            notify: true,
            title: "Stopped Tracking",
            description: "You are not tracked any longer"
          },
          enter: {
            notify: true,
            title: "Willkommen",
            description: "Willkommen bei der [value]"
          },
          exit: {
            notify: true,
            title: "Left Zone",
            description: "You left a [value] Zone"
          }
        }
      );
    }
    fail(errorCode: number) {
        console.log("Fail to start geofencing. Error code:", errorCode);
    }

    startMonitoring(){
        let geofences = [
          {
            key: "hochschuleMuenchen",
            latitude: 48.154278,
            longitude: 11.553861,
            radius: 200,
            value: "Hochschule München"
          }
        ];
        RNSimpleNativeGeofencing.addGeofences(geofences, 3000000, this.fail);
    }

    stopMonitoring(){
        RNSimpleNativeGeofencing.removeAllGeofences();
    }

    render() {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Geofencing Demo App</Text>
          <TouchableOpacity
            onPress={this.startMonitoring.bind(this)}
            style={{
              backgroundColor: 'blue',
              padding: 10,
              borderRadius: 5,
              marginTop: 20,
            }}>
            <Text style={{ color: 'white' }}>Start Monitoring</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.stopMonitoring.bind(this)}
            style={{
              backgroundColor: 'red',
              padding: 10,
              borderRadius: 5,
              marginTop: 20,
            }}>
            <Text style={{ color: 'white' }}>Stop Monitoring</Text>
          </TouchableOpacity>
        </View>
      );
    }
}
