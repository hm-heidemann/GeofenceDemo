import React, { Component } from 'react';
import { View, Text, PermissionsAndroid, Platform, Button } from 'react-native';
import RNSimpleNativeGeofencing from '@shehang/react-native-simple-native-geofencing';

async function requestLocationPermission() {
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
};

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
            title: "Attention",
            //[value] will be replaced ob geofences' value attribute
            description: "You entered a [value] Zone"
          },
          exit: {
            notify: true,
            title: "Left Zone",
            description: "You left a [value] Zone"
          }
        }
      );
    }
    fail() {
        console.log("Fail to start geofencing")
    }

    startMonitoring(){
        let geofences = [
          {
            key: "geoNum3",
            latitude: 47.423,
            longitude: -122.084,
            radius: 150,
            value: "red"
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
          <Button
            title="Start Monitoring"
            onPress={this.startMonitoring}
          />
          <Button
            title="Stop Monitoring"
            onPress={this.stopMonitoring}
          />
        </View>
      );
    }
}
