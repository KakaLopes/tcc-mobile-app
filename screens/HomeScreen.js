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
  latitude: 53.31765337169595,
  longitude: -6.285206028486653,
};

const MAX_DISTANCE_METERS = 100;

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [hoursToday, setHoursToday] = useState(0);
  const [entriesCount, setEntriesCount] = useState(0);
  const [openEntry, setOpenEntry] = useState(false);
  const [qrHandled, setQrHandled] = useState(false);
  const [annualLeaveDays, setAnnualLeaveDays] = useState(0);
  const [leaveBalance, setLeaveBalance] = useState(0);

  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    loadUser();
    loadDashboardData();
    loadLeaveBalance();
  }, []);

  useEffect(() => {
    if (params?.qrValid === "true" && !qrHandled) {
      setQrHandled(true);

      if (params?.action === "in") {
        handleClockIn();
      } else if (params?.action === "out") {
        handleClockOut();
      }
    }
  }, [params, qrHandled]);

  async function loadLeaveBalance() {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) return;

      const response = await api.get("/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setAnnualLeaveDays(data?.annual_leave_days || 20);
      setLeaveBalance(
        data?.leave_balance != null
          ? data.leave_balance
          : data?.annual_leave_days || 20
      );
    } catch (error) {
      console.log(
        "LOAD LEAVE BALANCE ERROR:",
        error?.response?.data || error.message
      );
    }
  }

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
      console.log("DASHBOARD ERROR:", error?.response?.data || error.message);
    }
  }

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function validateLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission denied", "Location is required.");
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

    console.log("DISTANCE:", distance);

    if (distance > MAX_DISTANCE_METERS) {
      Alert.alert(
        "Out of range",
        "You must be at the workplace to clock in/out."
      );
      return false;
    }

    return true;
  }

  async function handleClockIn() {
    try {
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
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to register clock-in"
      );
    }
  }

  async function handleClockOut() {
    try {
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
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to register clock-out"
      );
    }
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

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Daily Summary</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hours today</Text>
          <Text style={styles.infoValue}>{hoursToday}h</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total entries</Text>
          <Text style={styles.infoValue}>{entriesCount}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Shift status</Text>
          <Text style={openEntry ? styles.statusOpen : styles.statusClosed}>
            {openEntry ? "Working..." : "No active shift"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Annual leave</Text>
          <Text style={styles.infoValue}>{annualLeaveDays} days</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Leave balance</Text>
          <Text style={styles.infoValue}>{leaveBalance} days</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Work Actions</Text>

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

      <Text style={styles.sectionTitle}>Leave Management</Text>

      <TouchableOpacity
        style={styles.leaveButton}
        onPress={() => router.push("/request-leave")}
      >
        <Text style={styles.leaveButtonText}>Request Leave</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.myLeavesButton}
        onPress={() => router.push("/my-leaves")}
      >
        <Text style={styles.myLeavesButtonText}>My Leave Requests</Text>
      </TouchableOpacity>

      {user?.role === "admin" && (
  <>
    <Text style={styles.sectionTitle}>Admin Tools</Text>

    <TouchableOpacity
      style={styles.adminButton}
      onPress={() => router.push("/admin-panel")}
    >
      <Text style={styles.adminButtonText}>Admin Panel</Text>
    </TouchableOpacity>
  </>
)}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f7fb",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 10,
  },
  welcome: {
    fontSize: 18,
    textAlign: "center",
    color: "#374151",
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 14,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  statusOpen: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#d97706",
  },
  statusClosed: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#15803d",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  secondaryButtonText: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
  leaveButton: {
    backgroundColor: "#f59e0b",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  leaveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
  myLeavesButton: {
    backgroundColor: "#0ea5e9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
  },
  myLeavesButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
  adminButton: {
    backgroundColor: "#7c3aed",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  adminButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
 
  logoutButton: {
    backgroundColor: "#dc2626",
    padding: 15,
    borderRadius: 12,
    marginTop: 4,
  },
  logoutButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },
});