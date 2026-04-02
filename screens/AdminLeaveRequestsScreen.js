import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function AdminLeaveRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  async function loadLeaveRequests() {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await api.get("/leaves", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response.data || []);
    } catch (error) {
      console.log(
        "LOAD LEAVES ERROR:",
        error?.response?.data || error.message
      );

      Alert.alert("Error", "Unable to load leave requests");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const token = await AsyncStorage.getItem("token");

      await api.put(
        `/leave/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Success",
        status === "approved"
          ? "Leave request approved"
          : "Leave request rejected"
      );

      loadLeaveRequests();
    } catch (error) {
      console.log(
        "UPDATE LEAVE STATUS ERROR:",
        error?.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to update leave request"
      );
    }
  }

  function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function calculateDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  function renderStatus(status) {
    if (status === "approved") return styles.statusApproved;
    if (status === "rejected") return styles.statusRejected;
    return styles.statusPending;
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Text style={styles.name}>
          {item.user?.full_name || "Unknown employee"}
        </Text>
        <Text style={styles.email}>{item.user?.email || "-"}</Text>

        <Text style={styles.info}>Type: {item.leave_type}</Text>
        <Text style={styles.info}>Start: {formatDate(item.start_date)}</Text>
        <Text style={styles.info}>End: {formatDate(item.end_date)}</Text>
        <Text style={styles.info}>
          Days: {calculateDays(item.start_date, item.end_date)}
        </Text>
        <Text style={styles.info}>Reason: {item.reason || "-"}</Text>

        <Text style={[styles.status, renderStatus(item.status)]}>
          Status: {item.status}
        </Text>

        {item.status === "pending" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => updateStatus(item.id, "approved")}
            >
              <Text style={styles.actionText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => updateStatus(item.id, "rejected")}
            >
              <Text style={styles.actionText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave Requests</Text>

      {requests.length === 0 ? (
        <Text style={styles.empty}>No leave requests found.</Text>
      ) : (
        <FlatList
          data={requests}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 20,
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
    marginTop: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 10,
  },
  info: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 4,
  },
  status: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 15,
  },
  statusPending: {
    color: "#d97706",
  },
  statusApproved: {
    color: "#15803d",
  },
  statusRejected: {
    color: "#dc2626",
  },
  actions: {
    flexDirection: "row",
    marginTop: 14,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 10,
    marginRight: 6,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 10,
    marginLeft: 6,
  },
  actionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },
});