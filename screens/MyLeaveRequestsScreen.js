import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
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
      console.log(error);
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

  // ✅ NOVO: calcular dias
  function calculateDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Text style={styles.type}>{item.leave_type}</Text>

        <Text>Start: {formatDate(item.start_date)}</Text>
        <Text>End: {formatDate(item.end_date)}</Text>

        {/* 🔥 NOVO */}
        <Text>Days: {calculateDays(item.start_date, item.end_date)}</Text>

        <Text>Reason: {item.reason || "-"}</Text>

        <Text style={[styles.status, getStatusStyle(item.status)]}>
          {item.status}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  type: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  status: {
    marginTop: 10,
    fontWeight: "bold",
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
  },
});