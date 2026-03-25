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
import { useRouter } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import api from "../services/api";

export default function AdminReportsScreen() {
  const [user, setUser] = useState(null);
  const [report, setReport] = useState([]);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
    loadWeeklyReport();
  }, []);

  async function loadUser() {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (error) {
      console.log("LOAD USER ERROR:", error);
    }
  }

  async function loadWeeklyReport() {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await api.get("/admin/reports/admin-hours-week", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReport(response.data?.data || []);
      setWeekStart(response.data?.week_start || "");
      setWeekEnd(response.data?.week_end || "");
    } catch (error) {
      console.log("REPORT ERROR:", error);
      Alert.alert("Error", "Unable to load report");
    } finally {
      setLoading(false);
    }
  }

  function formatHours(totalHours) {
    const h = Math.floor(totalHours || 0);
    const m = Math.round(((totalHours || 0) - h) * 60);
    return `${h}h ${m}min`;
  }

  async function handleExportPDF() {
    try {
      const html = `
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h1>Weekly Report</h1>
            <p><strong>Week:</strong> ${weekStart} to ${weekEnd}</p>
            <hr />
            ${report
              .map(
                (item) => `
                <p>
                  <strong>${item.user.full_name}</strong><br/>
                  ${item.user.email}<br/>
                  Worked: ${formatHours(item.total_hours)}
                </p>
              `
              )
              .join("")}
          </body>
        </html>
      `;

      const file = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(file.uri);

    } catch (error) {
      console.log("PDF ERROR:", error);
      Alert.alert("Error", "Failed to generate PDF");
    }
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.user?.full_name}</Text>
        <Text style={styles.email}>{item.user?.email}</Text>
        <Text style={styles.hours}>
          Worked: {formatHours(item.total_hours)}
        </Text>
      </View>
    );
  }

  if (user && user.role !== "admin") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Access denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Reports</Text>

      <View style={styles.summaryCard}>
        <Text>Week: {weekStart} to {weekEnd}</Text>
        <Text>Total employees: {report.length}</Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
        <Text style={styles.buttonText}>Export PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={loadWeeklyReport}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={report}
          keyExtractor={(item) => item.user.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f7fb" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  exportButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
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
    marginBottom: 10,
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
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  email: { color: "#6b7280" },
  hours: { color: "#0f766e", fontWeight: "bold" },
});