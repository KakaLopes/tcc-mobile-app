import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../services/api";

export default function AdminAdjustmentsScreen() {
  const [adjustments, setAdjustments] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadUser();
    loadAdjustments();
  }, []);

  async function loadUser() {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.log("LOAD USER ERROR:", error);
    }
  }

  async function loadAdjustments() {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Token not found. Please log in again.");
        return;
      }

      const response = await api.get("/admin/adjustments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAdjustments(response.data || []);
    } catch (error) {
      console.log(
        "LOAD ADJUSTMENTS ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert("Error", "Unable to load adjustments");
    }
  }

  async function approve(id) {
    try {
      const token = await AsyncStorage.getItem("token");

      await api.post(
        `/admin/adjustments/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Adjustment approved successfully");
      loadAdjustments();
    } catch (error) {
      console.log("APPROVE ERROR:", error?.response?.data || error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to approve adjustment"
      );
    }
  }

  async function reject(id) {
    try {
      const token = await AsyncStorage.getItem("token");

      await api.post(
        `/admin/adjustments/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Adjustment rejected successfully");
      loadAdjustments();
    } catch (error) {
      console.log("REJECT ERROR:", error?.response?.data || error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to reject adjustment"
      );
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IE");
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString("en-IE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Text style={styles.titleCard}>📅 {formatDate(item.created_at)}</Text>

        <Text style={styles.text}>
          🕐 New time: {formatTime(item.new_value)}
        </Text>

        <Text style={styles.text}>📝 Reason: {item.reason}</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.approve}
            onPress={() => approve(item.id)}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reject}
            onPress={() => reject(item.id)}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (user && user.role !== "admin") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Access denied</Text>
        <Text style={styles.empty}>
          This area is restricted to administrators only.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Adjustments</Text>

      <TouchableOpacity style={styles.refreshButton} onPress={loadAdjustments}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

      {adjustments.length === 0 ? (
        <Text style={styles.empty}>No pending adjustments.</Text>
      ) : (
        <FlatList
          data={adjustments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fb",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
    textAlign: "center",
  },
  reportButton: {
    backgroundColor: "#0f766e",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  reportButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  refreshButtonText: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  titleCard: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: "#374151",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  approve: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 6,
  },
  reject: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 6,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  empty: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginTop: 40,
  },
});