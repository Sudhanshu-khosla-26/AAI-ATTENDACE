/**
 * AAI Attendance App - Geofence Map Component
 * Shows user location and workplace geofence on map
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Circle, Polygon } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { formatDistance, getMapRegion } from '../utils/locationUtils';

const { width, height } = Dimensions.get('window');

const GeofenceMap = ({
  userLocation,
  workplace,
  isInsideGeofence,
  distance,
  style = {},
  showInfo = true,
}) => {
  if (!userLocation || !workplace) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <Ionicons name="map" size={48} color={Colors.textLight} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const region = getMapRegion([
    userLocation,
    { latitude: workplace.latitude, longitude: workplace.longitude },
  ]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={false}
        showsMyLocationButton={true}
        showsCompass={true}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {/* User Location Marker */}
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Your Location"
        >
          <View style={styles.userMarker}>
            <View style={styles.userMarkerDot} />
            <View style={styles.userMarkerPulse} />
          </View>
        </Marker>

        {/* Workplace Marker */}
        <Marker
          coordinate={{
            latitude: workplace.latitude,
            longitude: workplace.longitude,
          }}
          title={workplace.name}
          description={`Airport Code: ${workplace.code}`}
        >
          <View style={styles.workplaceMarker}>
            <Ionicons name="business" size={20} color={Colors.textWhite} />
          </View>
        </Marker>

        {/* Geofence - Polygon if defined, otherwise Circle */}
        {workplace.polygonPoints && workplace.polygonPoints.length >= 3 ? (
          <Polygon
            coordinates={workplace.polygonPoints}
            fillColor={isInsideGeofence ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
            strokeColor={isInsideGeofence ? Colors.success : Colors.error}
            strokeWidth={2}
          />
        ) : (
          <Circle
            center={{
              latitude: workplace.latitude,
              longitude: workplace.longitude,
            }}
            radius={workplace.radius || 200}
            fillColor={isInsideGeofence ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
            strokeColor={isInsideGeofence ? Colors.success : Colors.error}
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* Info Card */}
      {showInfo && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name={isInsideGeofence ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isInsideGeofence ? Colors.success : Colors.error}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                {isInsideGeofence ? 'Inside Geofence' : 'Outside Geofence'}
              </Text>
              <Text style={styles.infoSubtitle}>
                Distance: {formatDistance(distance)}
              </Text>
            </View>
          </View>
          <View style={styles.coordinatesRow}>
            <Text style={styles.coordinatesText}>
              Your Location: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: height * 0.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textLight,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  userMarker: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.info,
    borderWidth: 3,
    borderColor: Colors.textWhite,
    zIndex: 2,
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.info + '40',
    zIndex: 1,
  },
  workplaceMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.textWhite,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  infoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  infoSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  coordinatesRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  coordinatesText: {
    fontSize: 11,
    color: Colors.textLight,
    fontFamily: 'monospace',
  },
});

export default GeofenceMap;
