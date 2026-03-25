import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import api from "../services/api";

const COMPANY_LOCATION = {
  latitude: 53.3498,
  longitude: -6.2603,
};

const MAX_DISTANCE_METERS = 100;

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [hoursToday, setHoursToday] = useState(0);
  const [entriesCount, setEntriesCount] = useState(0);
  const [openEntry, setOpenEntry] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    loadUser();
    loadDashboardData();
  }, []);

  // 🔥 QR RETURN HANDLER
  useEffect(() => {
    if (params?.qrValid === "true") {
      if (params?.action === "in") {
        handleClockIn();
      } else if (params?.action === "out") {
        handleClockOut();
      }
    }
  }, [params]);

  async function loadUser() {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!savedUser || !token) {
        router.replace("login");
        return;
      }

      setUser(JSON.parse(savedUser));
    } catch (error) {
      router.replace("login");
    }
  }

  async function loadDashboardData() {
    try {
      const token = await AsyncStorage.getItem("token");

      const [hoursResponse, entriesResponse] = await Promise.all([
        api.get("/my-hours-today", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/my-entries", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setHoursToday(hoursResponse.data.total_hours || 0);

      const entries = entriesResponse.data || [];
      setEntriesCount(entries.length);

      const hasOpenEntry = entries.some((item) => !item.clock_out);
      setOpenEntry(hasOpenEntry);
    } catch (error) {
      console.log(error);
    }
  }

  // 📍 DISTÂNCIA
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // 📍 VALIDAR LOCALIZAÇÃO
  async function validateLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission denied", "Location required.");
      return false;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const distance = getDistance(
      latitude,
      longitude,
      COMPANY_LOCATION.latitude,
      COMPANY_LOCATION.longitude
    );

    if (distance > MAX_DISTANCE_METERS) {
      Alert.alert("Out of range", "You are not at the workplace.");
      return false;
    }

    return true;
  }

  async function handleClockIn() {
    const valid = await validateLocation();
    if (!valid) return;

    const token = await AsyncStorage.getItem("token");

    await api.post(
      "/clock-in",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    Alert.alert("Success", "Clock-in registered");
    loadDashboardData();
  }

  async function handleClockOut() {
    const valid = await validateLocation();
    if (!valid) return;

    const token = await AsyncStorage.getItem("token");

    await api.post(
      "/clock-out",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    Alert.alert("Success", "Clock-out registered");
    loadDashboardData();
  }

  async function handleLogout() {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    router.replace("login");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Time Tracker</Text>

      <Text style={styles.welcome}>
        Welcome, {user?.full_name || "User"} 👋
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() =>
          router.push({ pathname: "/qr-scanner", params: { action: "in" } })
        }
      >
        <Text style={styles.primaryButtonText}>Clock In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          router.push({ pathname: "/qr-scanner", params: { action: "out" } })
        }
      >
        <Text style={styles.secondaryButtonText}>Clock Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}