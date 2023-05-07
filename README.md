# Expo Geofencing Demo App

Diese Demo-App zeigt, wie man Geofencing mit den [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/), [Expo TaskManager](https://docs.expo.dev/versions/latest/sdk/task-manager/) und [react-native-maps](https://github.com/react-native-maps/react-native-maps) Bibliotheken implementiert. Die App erlaubt das Starten und Stoppen des Geofencing-Monitorings und zeigt die definierten Geofencing-Regionen auf der Karte an. Beim Betreten/Verlassen einer Region wird ein Log/Alert getriggert.

## Kernelemente der App

- **Regions**: Die `regions`-Konstante enthält die Liste der Geofencing-Regionen, die als Kreise auf der Karte dargestellt werden. Jede Region hat einen eindeutigen Bezeichner, geografische Koordinaten (Breiten- und Längengrad) und einen Radius. Zum Beispiel:

  ```javascript
  const regions = [
    {
      identifier: 'Hochschule München Campus Lothstraße',
      latitude: 48.154278,
      longitude: 11.553861,
      radius: 200,
      notifyOnEnter: true,
      notifyOnExit: true,
    },
  ];
  ```

- **Location**: Die `expo-location`-Bibliothek wird verwendet, um die Standortberechtigungen abzufragen, die aktuelle Position des Benutzers zu ermitteln und das Geofencing zu starten oder zu stoppen.
  - **Permissions**: Anforden der Standortberechtigungen für den Vorder- und Hintergrund

    ```javascript
    Location.requestForegroundPermissionsAsync();
    Location.requestBackgroundPermissionsAsync();
    ```

  - **Current Position**: Ermittlung der aktuellen Position

    ```javascript
    Location.getCurrentPositionAsync();
    ```

  - **Start/Stop Geofencing**: Start/Stop des Geofencing-Monitorings 
  
    ```ruby
    Location.startGeofencingAsync(TASK, regions);
    Location.stopGeofencingAsync(TASK);
    ```

- **TaskManager**: Der `expo-task-manager` wird verwendet, um einen Hintergrundaufgabe für das Geofencing zu definieren. Diese Aufgabe wird aufgerufen, wenn der Benutzer eine Geofencing-Region betritt oder verlässt.

## Anleitung

1. Klone oder lade das Projekt herunter und navigiere in das Projektverzeichnis.
2. Führe `npm install` aus, um die erforderlichen Abhängigkeiten zu installieren.
3. Starte die App mit `npm start`.
4. Öffne die App auf einem Gerät oder Emulator.

## Anpassungen

Um eigene Geofencing-Regionen hinzuzufügen oder zu ändern, bearbeite die `regions`-Konstante und gib die gewünschten Koordinaten und Radien für die Regionen an.
