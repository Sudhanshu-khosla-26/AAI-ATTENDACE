/**
 * AAI Attendance App - Location Management Screen
 * Admin interface for managing workplace locations and geofences
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle, Polygon } from 'react-native-maps';

import Colors from '../constants/colors';
import { getAllLocations, addLocation, updateLocation, deleteLocation, addPolygonPoint, clearPolygonPoints } from '../services/locationService';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Toast from '../components/Toast';

const { width, height } = Dimensions.get('window');

export default function LocationManagementScreen() {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    latitude: '',
    longitude: '',
    radius: '200',
  });

  // Map state for polygon drawing
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    const data = await getAllLocations();
    setLocations(data);
    setLoading(false);
  };

  const handleAddLocation = () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedLocation(null);
    setFormData({
      name: '',
      code: '',
      latitude: '',
      longitude: '',
      radius: '200',
    });
    setPolygonPoints([]);
  };

  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setIsEditing(true);
    setIsAdding(false);
    setFormData({
      name: location.name,
      code: location.code,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: location.radius.toString(),
    });
    setPolygonPoints(location.polygonPoints || []);
  };

  const handleSaveLocation = async () => {
    const locationData = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius: parseInt(formData.radius),
      polygonPoints: polygonPoints.length >= 3 ? polygonPoints : null,
    };

    let result;
    if (isAdding) {
      result = await addLocation(locationData);
    } else {
      result = await updateLocation(selectedLocation.id, locationData);
    }

    if (result.success) {
      setToast({
        visible: true,
        message: `Location ${isAdding ? 'added' : 'updated'} successfully`,
        type: 'success',
      });
      setIsAdding(false);
      setIsEditing(false);
      setSelectedLocation(null);
      loadLocations();
    } else {
      setToast({
        visible: true,
        message: result.error || 'Operation failed',
        type: 'error',
      });
    }
  };

  const handleDeleteLocation = (location) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete ${location.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteLocation(location.id);
            if (result.success) {
              setToast({
                visible: true,
                message: 'Location deleted successfully',
                type: 'success',
              });
              loadLocations();
            } else {
              setToast({
                visible: true,
                message: result.error || 'Delete failed',
                type: 'error',
              });
            }
          },
        },
      ]
    );
  };

  const handleMapPress = (e) => {
    if (!isAdding && !isEditing) return;
    
    const { coordinate } = e.nativeEvent;
    
    if (isDrawingPolygon) {
      setPolygonPoints([...polygonPoints, coordinate]);
    } else {
      setFormData({
        ...formData,
        latitude: coordinate.latitude.toString(),
        longitude: coordinate.longitude.toString(),
      });
    }
  };

  const renderLocationList = () => (
    <ScrollView contentContainerStyle={styles.listContent}>
      <Button
        title="Add New Location"
        onPress={handleAddLocation}
        icon="add"
        fullWidth
        style={styles.addButton}
      />

      {locations.map((location) => (
        <Card key={location.id} style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationCode}>Code: {location.code}</Text>
            </View>
            <View style={styles.locationActions}>
              <TouchableOpacity
                onPress={() => handleEditLocation(location)}
                style={styles.actionButton}
              >
                <Ionicons name="create" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteLocation(location)}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.locationDetails}>
            <LocationDetail icon="location" text={`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`} />
            <LocationDetail icon="radio-button-on" text={`Radius: ${location.radius}m`} />
            {location.polygonPoints && (
              <LocationDetail icon="shapes" text={`Polygon: ${location.polygonPoints.length} points`} />
            )}
          </View>
        </Card>
      ))}
    </ScrollView>
  );

  const renderLocationForm = () => (
    <ScrollView contentContainerStyle={styles.formContent}>
      <Text style={styles.formTitle}>
        {isAdding ? 'Add New Location' : 'Edit Location'}
      </Text>

      <Input
        label="Location Name"
        placeholder="e.g., Indira Gandhi International Airport"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        icon="business"
      />

      <Input
        label="Airport Code"
        placeholder="e.g., DEL"
        value={formData.code}
        onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
        icon="code"
        autoCapitalize="characters"
        maxLength={5}
        editable={isAdding}
      />

      <View style={styles.coordinateRow}>
        <View style={styles.coordinateField}>
          <Input
            label="Latitude"
            placeholder="e.g., 28.5562"
            value={formData.latitude}
            onChangeText={(text) => setFormData({ ...formData, latitude: text })}
            keyboardType="decimal-pad"
            icon="navigate"
          />
        </View>
        <View style={styles.coordinateField}>
          <Input
            label="Longitude"
            placeholder="e.g., 77.1000"
            value={formData.longitude}
            onChangeText={(text) => setFormData({ ...formData, longitude: text })}
            keyboardType="decimal-pad"
            icon="navigate"
          />
        </View>
      </View>

      <Input
        label="Geofence Radius (meters)"
        placeholder="e.g., 200"
        value={formData.radius}
        onChangeText={(text) => setFormData({ ...formData, radius: text })}
        keyboardType="number-pad"
        icon="radio-button-on"
      />

      {/* Map for selecting location */}
      <Text style={styles.mapLabel}>Tap on map to set location</Text>
      <MapView
        style={styles.map}
        region={{
          latitude: parseFloat(formData.latitude) || 20.5937,
          longitude: parseFloat(formData.longitude) || 78.9629,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {formData.latitude && formData.longitude && (
          <>
            <Marker
              coordinate={{
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
              }}
              title={formData.name || 'New Location'}
            />
            <Circle
              center={{
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
              }}
              radius={parseInt(formData.radius) || 200}
              fillColor="rgba(10, 36, 99, 0.2)"
              strokeColor={Colors.primary}
              strokeWidth={2}
            />
          </>
        )}
        {polygonPoints.length > 0 && (
          <Polygon
            coordinates={polygonPoints}
            fillColor="rgba(16, 185, 129, 0.2)"
            strokeColor={Colors.success}
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* Polygon Drawing Controls */}
      <View style={styles.polygonControls}>
        <Button
          title={isDrawingPolygon ? 'Stop Drawing' : 'Draw Polygon'}
          onPress={() => setIsDrawingPolygon(!isDrawingPolygon)}
          variant={isDrawingPolygon ? 'secondary' : 'outline'}
          icon={isDrawingPolygon ? 'close' : 'shapes'}
          style={styles.polygonButton}
        />
        {polygonPoints.length > 0 && (
          <Button
            title="Clear Polygon"
            onPress={() => setPolygonPoints([])}
            variant="danger"
            icon="trash"
            style={styles.polygonButton}
          />
        )}
      </View>
      
      {isDrawingPolygon && (
        <Text style={styles.polygonHint}>
          Tap on the map to add polygon points (minimum 3 points)
        </Text>
      )}
      
      {polygonPoints.length > 0 && (
        <Text style={styles.polygonCount}>
          Polygon points: {polygonPoints.length}
        </Text>
      )}

      <View style={styles.formButtons}>
        <Button
          title="Cancel"
          onPress={() => {
            setIsAdding(false);
            setIsEditing(false);
            setSelectedLocation(null);
          }}
          variant="outline"
          style={styles.formButton}
        />
        <Button
          title="Save"
          onPress={handleSaveLocation}
          style={styles.formButton}
        />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      
      <Header
        title="Location Management"
        showBack
        onBackPress={() => router.back()}
      />

      {isAdding || isEditing ? renderLocationForm() : renderLocationList()}

      <Loading visible={loading} overlay />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
}

const LocationDetail = ({ icon, text }) => (
  <View style={styles.detailRow}>
    <Ionicons name={icon} size={16} color={Colors.textLight} />
    <Text style={styles.detailText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  addButton: {
    marginBottom: 16,
  },
  locationCard: {
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  locationCode: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  locationActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  locationDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  formContent: {
    padding: 16,
    paddingBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
  },
  coordinateRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  coordinateField: {
    flex: 1,
    marginHorizontal: 8,
  },
  mapLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  map: {
    width: width - 32,
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  polygonControls: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  polygonButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  polygonHint: {
    fontSize: 12,
    color: Colors.info,
    textAlign: 'center',
    marginBottom: 8,
  },
  polygonCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  formButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
