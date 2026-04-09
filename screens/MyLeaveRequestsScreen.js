import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function MyLeaveRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyLeaves();
  }, []);

  async function loadMyLeaves() {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await api.get("/leave/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response.data || []);
    } catch (error) {
      console.log(
        "LOAD MY LEAVES ERROR:",
        error?.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyle(status) {
    if (status === "approved") return styles.approved;
    if (status === "rejected") return styles.rejected;
    return styles.pending;
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

  function formatLeaveType(type) {
    if (!type) return "-";

    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Text style={styles.type}>{formatLeaveType(item.leave_type)}</Text>

        <Text style={styles.info}>Start: {formatDate(item.start_date)}</Text>
        <Text style={styles.info}>End: {formatDate(item.end_date)}</Text>
        <Text style={styles.info}>
          Days: {calculateDays(item.start_date, item.end_date)}
        </Text>
        <Text style={styles.info}>Reason: {item.reason || "-"}</Text>

        <Text style={[styles.status, getStatusStyle(item.status)]}>
          {formatLeaveType(item.status)}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Leave Requests</Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No leave requests found.</Text>
        }
      />
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
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 180,
  },
  type: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
    color: "#111827",
  },
  info: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
  },
  status: {
    marginTop: 12,
    fontWeight: "bold",
    fontSize: 16,
  },
  approved: {
    color: "green",
  },
  rejected: {
    color: "red",
  },
  pending: {
    color: "orange",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
    fontSize: 16,
  },
});