import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapView = ({ children, style, region }) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.text}>Map View (Native Only)</Text>
            {region && (
                <Text style={styles.regionText}>
                    Lat: {region.latitude.toFixed(4)}, Long: {region.longitude.toFixed(4)}
                </Text>
            )}
            {children}
        </View>
    );
};

const Marker = ({ coordinate, title, children }) => {
    return (
        <View style={styles.marker}>
            <Text style={styles.markerText}>📍 {title || 'Marker'}</Text>
            {children}
        </View>
    );
};

const Circle = ({ center, radius }) => {
    return (
        <View style={styles.circle}>
            <Text style={styles.circleText}>⭕ Geofence ({radius}m)</Text>
        </View>
    );
};

const Polygon = ({ coordinates }) => {
    return (
        <View style={styles.polygon}>
            <Text style={styles.polygonText}>⬡ Polygon ({coordinates?.length} points)</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    regionText: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
    },
    marker: {
        marginTop: 8,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 4,
    },
    markerText: {
        fontSize: 12,
    },
    circle: {
        marginTop: 4,
    },
    circleText: {
        fontSize: 10,
        color: '#0a2463',
    },
    polygon: {
        marginTop: 4,
    },
    polygonText: {
        fontSize: 10,
        color: '#10b981',
    },
});

export { Marker, Circle, Polygon };
export default MapView;
