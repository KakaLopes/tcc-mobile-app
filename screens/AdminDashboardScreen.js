import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../services/api";

export default function AdminDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [report, setReport] = useState([]);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Token not found. Please log in again.");
        return;
      }

      const [usersResponse, reportResponse] = await Promise.all([
        api.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/admin/reports/admin-hours-week", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const usersData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : [];

      const reportData = Array.isArray(reportResponse.data?.data)
        ? reportResponse.data.data
        : [];

      setEmployees(usersData);
      setReport(reportData);
      setWeekStart(reportResponse.data?.week_start || "");
      setWeekEnd(reportResponse.data?.week_end || "");
    } catch (error) {
      console.log(
        "ADMIN DASHBOARD ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert("Error", "Unable to load admin dashboard");
    } finally {
      setLoading(false);
    }
  }

  function isCashInHand(employee) {
    return (
      employee?.cash_in_hand === true ||
      employee?.payment_type === "cash_in_hand" ||
      employee?.paymentType === "cash_in_hand"
    );
  }

  function getTotalHours() {
    return report.reduce((sum, item) => sum + (item.total_hours || 0), 0);
  }

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((employee) => employee.active !== false).length;
  const inactiveEmployees = employees.filter((employee) => employee.active === false).length;
  const cashInHandEmployees = employees.filter((employee) => isCashInHand(employee)).length;
  const totalHoursThisWeek = getTotalHours();

  function formatHours(totalHours) {
    const h = Math.floor(totalHours || 0);
    const m = Math.round(((totalHours || 0) - h) * 60);
    return `${h}h ${m}min`;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.periodCard}>
        <Text style={styles.periodTitle}>Current Week</Text>
        <Text style={styles.periodText}>
          {weekStart} to {weekEnd}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Employees</Text>
        <Text style={styles.metric}>Total employees: {totalEmployees}</Text>
        <Text style={styles.metric}>Active employees: {activeEmployees}</Text>
        <Text style={styles.metric}>Inactive employees: {inactiveEmployees}</Text>
        <Text style={styles.metric}>Cash in hand: {cashInHandEmployees}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Summary</Text>
        <Text style={styles.metric}>
          Total hours this week: {formatHours(totalHoursThisWeek)}
        </Text>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadDashboard}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#111827",
  },
  periodCard: {
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1d4ed8",
    marginBottom: 4,
  },
  periodText: {
    fontSize: 15,
    color: "#1f2937",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  metric: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 6,
  },
  refreshButton: {
    backgroundColor: "#0f766e",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  backText: {
    textAlign: "center",
    fontWeight: "600",
  },
});