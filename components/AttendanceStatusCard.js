/**
 * AAI Attendance App - Attendance Status Card
 * Compact modern design with blue shades. iPhone 12 optimised.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';
import { formatDate, formatTime } from '../utils/dateUtils';

const AttendanceStatusCard = ({ status, onCheckIn, onCheckOut, loading = false }) => {
  const {
    hasCheckedIn,
    hasCheckedOut,
    checkInTime,
    checkOutTime,
    totalHours,
    checkInPhoto,
    checkOutPhoto,
  } = status || {};

  const getConfig = () => {
    if (!hasCheckedIn) return {
      icon: 'time-outline',
      badge: 'NOT CHECKED IN',
      badgeColor: '#FF9933',
      title: 'Mark Attendance',
      sub: 'Tap to begin your duty for today',
      btnLabel: 'Check In',
      btnIcon: 'log-in-outline',
      btnColors: ['#003366', '#0055AA'],
      done: false,
    };
    if (!hasCheckedOut) return {
      icon: 'checkmark-circle-outline',
      badge: 'ON DUTY',
      badgeColor: '#10B981',
      title: `In since ${formatTime(checkInTime)}`,
      sub: 'Have a productive day!',
      btnLabel: 'Check Out',
      btnIcon: 'log-out-outline',
      btnColors: ['#0055AA', '#007ACC'],
      done: false,
    };
    return {
      icon: 'shield-checkmark-outline',
      badge: 'COMPLETED',
      badgeColor: '#10B981',
      title: `${totalHours || 0}h logged`,
      sub: 'Attendance marked for today',
      btnLabel: 'Re-Check Out',
      btnIcon: 'refresh-outline',
      btnColors: ['#4B5563', '#374151'],
      done: false, // Allow clicking to re-check out
      isRecheck: true
    };
  };

  const cfg = getConfig();

  return (
    <LinearGradient
      colors={['#003366', '#0055AA', '#006FD6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Decorative circles */}
      <View style={styles.deco1} />
      <View style={styles.deco2} />

      {/* Top row: date + badge */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.dayLabel}>{formatDate(new Date(), 'EEEE')}</Text>
          <Text style={styles.dateText}>{formatDate(new Date(), 'dd MMM yyyy')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={[styles.badge, { borderColor: cfg.badgeColor + '60', backgroundColor: cfg.badgeColor + '22' }]}>
            <View style={[styles.badgeDot, { backgroundColor: cfg.badgeColor }]} />
            <Text style={[styles.badgeText, { color: cfg.badgeColor }]}>{cfg.badge}</Text>
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusRow}>
        <View style={styles.statusIconBg}>
          <Ionicons name={cfg.icon} size={22} color="rgba(255,255,255,0.9)" />
        </View>
        <View style={styles.statusTexts}>
          <Text style={styles.statusTitle}>{cfg.title}</Text>
          <Text style={styles.statusSub}>{cfg.sub}</Text>
        </View>
      </View>

      {/* Times row (only when checked in) */}
      {hasCheckedIn && (
        <View style={styles.timesContainer}>
          <TimeBox label="Check In" time={checkInTime} photo={checkInPhoto} active />
          <View style={styles.timeSep}>
            <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.3)" />
          </View>
          <TimeBox label="Check Out" time={checkOutTime} photo={checkOutPhoto} active={hasCheckedOut} />
        </View>
      )}

      {/* Action button */}
      <TouchableOpacity
        onPress={loading ? null : (hasCheckedIn ? onCheckOut : onCheckIn)}
        disabled={loading}
        activeOpacity={0.8}
        style={styles.btn}
      >
        <View style={[styles.btnInner, cfg.done && styles.btnDone, cfg.isRecheck && styles.btnRecheck]}>
          <Ionicons name={cfg.btnIcon} size={17} color="#fff" />
          <Text style={styles.btnText}>{cfg.btnLabel}</Text>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const TimeBox = ({ label, time, photo, active }) => (
  <View style={styles.timeBox}>
    {photo ? (
      <Image source={{ uri: photo }} style={styles.timePic} />
    ) : (
      <View style={[styles.timeIconBg, !active && styles.timeIconBgDim]}>
        <Ionicons
          name={label === 'Check In' ? 'log-in-outline' : 'log-out-outline'}
          size={14}
          color={active ? '#fff' : 'rgba(255,255,255,0.25)'}
        />
      </View>
    )}
    <View>
      <Text style={styles.timeLabel}>{label}</Text>
      <Text style={[styles.timeVal, !active && styles.timeValDim]}>
        {time ? formatTime(time) : '--:--'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    // shadow
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  deco1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -50,
    right: -50,
  },
  deco2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: -30,
    left: -20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dayLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  statusIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTexts: { flex: 1 },
  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  statusSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginTop: 2,
  },
  timesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeIconBgDim: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timePic: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timeLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  timeVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  timeValDim: {
    color: 'rgba(255,255,255,0.25)',
  },
  timeSep: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  btn: {
    borderRadius: 13,
    overflow: 'hidden',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnDone: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnRecheck: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default AttendanceStatusCard;
