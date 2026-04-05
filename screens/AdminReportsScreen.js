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
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeScreen();
  }, []);

  async function initializeScreen() {
    try {
      setLoading(true);
      await loadUser();
      await loadEmployeesAndReport();
    } catch (error) {
      console.log("INITIALIZE SCREEN ERROR:", error);
      Alert.alert("Error", "Unable to load admin reports");
    } finally {
      setLoading(false);
    }
  }

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

  async function loadEmployeesAndReport() {
    try {
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

      setReport(reportData);
      setWeekStart(reportResponse.data?.week_start || "");
      setWeekEnd(reportResponse.data?.week_end || "");

      const reportMap = {};
      reportData.forEach((item) => {
        if (item?.user?.id) {
          reportMap[item.user.id] = item.total_hours || 0;
        }
      });

      const mergedEmployees = usersData.map((employee) => ({
        ...employee,
        total_hours: reportMap[employee.id] || 0,
      }));

      setEmployees(mergedEmployees);

      const defaultSelected = mergedEmployees
        .filter((employee) => !isCashInHand(employee))
        .map((employee) => employee.id);

      setSelectedEmployees(defaultSelected);
    } catch (error) {
      console.log(
        "LOAD EMPLOYEES/REPORT ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert("Error", "Unable to load employees and report");
    }
  }

  function formatHours(totalHours) {
    const h = Math.floor(totalHours || 0);
    const m = Math.round(((totalHours || 0) - h) * 60);
    return `${h}h ${m}min`;
  }

  function isCashInHand(employee) {
    return (
      employee?.cash_in_hand === true ||
      employee?.payment_type === "cash_in_hand" ||
      employee?.paymentType === "cash_in_hand"
    );
  }

  function toggleEmployeeSelection(employeeId) {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      }
      return [...prev, employeeId];
    });
  }

  function selectAllNonCashInHand() {
    const ids = employees
      .filter((employee) => !isCashInHand(employee))
      .map((employee) => employee.id);

    setSelectedEmployees(ids);
  }

  function clearSelection() {
    setSelectedEmployees([]);
  }

async function handleExportPDF() {
  try {
    const selectedData = employees.filter((employee) =>
      selectedEmployees.includes(employee.id)
    );

    if (selectedData.length === 0) {
      Alert.alert("Warning", "Please select at least one employee");
      return;
    }

    const officialPayroll = selectedData.filter(
      (employee) =>
        employee.active !== false &&
        employee.payment_type !== "cash_in_hand"
    );

    const cashPayments = selectedData.filter(
      (employee) =>
        employee.active !== false &&
        employee.payment_type === "cash_in_hand"
    );

    const inactiveEmployees = selectedData.filter(
      (employee) => employee.active === false
    );

    const html = `
      <html>
        <body style="font-family: Arial; padding: 24px; color: #111827;">
          <h1 style="margin-bottom: 8px;">Weekly Report</h1>
          <p><strong>Week:</strong> ${weekStart} to ${weekEnd}</p>
          <p><strong>Total selected employees:</strong> ${selectedData.length}</p>

          <hr style="margin: 20px 0;" />

          <h2 style="color: #2563eb;">Official Payroll</h2>
          <p style="margin-top: 0;">
            Employees included in the accountant report.
          </p>
          ${
            officialPayroll.length > 0
              ? officialPayroll
                  .map(
                    (item) => `
                      <div style="margin-bottom: 14px; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px;">
                        <strong>${item.full_name || "Employee"}</strong><br/>
                        ${item.email || "-"}<br/>
                        Payment type: ${item.payment_type || "Not defined"}<br/>
                        Worked: ${formatHours(item.total_hours)}
                      </div>
                    `
                  )
                  .join("")
              : `<p>No employees in official payroll for this selection.</p>`
          }

          <hr style="margin: 24px 0;" />

          <h2 style="color: #b45309;">Cash Payments</h2>
          <p style="margin-top: 0;">
            Internal operational record. Not included in accountant payroll.
          </p>
          ${
            cashPayments.length > 0
              ? cashPayments
                  .map(
                    (item) => `
                      <div style="margin-bottom: 14px; padding: 10px; border: 1px solid #f59e0b; border-radius: 8px; background: #fffbeb;">
                        <strong>${item.full_name || "Employee"}</strong><br/>
                        ${item.email || "-"}<br/>
                        Payment type: ${item.payment_type || "cash_in_hand"}<br/>
                        Worked: ${formatHours(item.total_hours)}
                      </div>
                    `
                  )
                  .join("")
              : `<p>No cash payments in this selection.</p>`
          }

          <hr style="margin: 24px 0;" />

          <h2 style="color: #dc2626;">Inactive Employees</h2>
          <p style="margin-top: 0;">
            Employees marked as inactive. Listed for reference only.
          </p>
          ${
            inactiveEmployees.length > 0
              ? inactiveEmployees
                  .map(
                    (item) => `
                      <div style="margin-bottom: 14px; padding: 10px; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2;">
                        <strong>${item.full_name || "Employee"}</strong><br/>
                        ${item.email || "-"}<br/>
                        Payment type: ${item.payment_type || "Not defined"}<br/>
                        Status: Inactive<br/>
                        Worked: ${formatHours(item.total_hours)}
                      </div>
                    `
                  )
                  .join("")
              : `<p>No inactive employees in this selection.</p>`
          }
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
    const isSelected = selectedEmployees.includes(item.id);
    const cashInHand = isCashInHand(item);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          cashInHand && styles.cardCashInHand,
        ]}
        onPress={() => toggleEmployeeSelection(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.hours}>
              Worked: {formatHours(item.total_hours)}
            </Text>

            {cashInHand && (
  <Text style={styles.cashLabel}>
    Cash in hand - visible in app, excluded from accountant PDF
  </Text>
)}
          </View>

          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            <Text style={styles.checkboxText}>{isSelected ? "✓" : ""}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
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
        <Text>Total employees: {employees.length}</Text>
        <Text>Selected for PDF: {selectedEmployees.length}</Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
        <Text style={styles.buttonText}>Export PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={selectAllNonCashInHand}
      >
        <Text style={styles.buttonText}>Select All</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
        <Text style={styles.buttonText}>Clear Selection</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadEmployeesAndReport}
      >
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No employees found.</Text>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },
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
  secondaryButton: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: "#dc2626",
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
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardSelected: {
    borderColor: "#2563eb",
    borderWidth: 2,
  },
  cardCashInHand: {
    backgroundColor: "#fef2f2",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  email: {
    color: "#6b7280",
    marginTop: 2,
  },
  hours: {
    color: "#0f766e",
    fontWeight: "bold",
    marginTop: 6,
  },
  cashLabel: {
    marginTop: 6,
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  checkboxText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
});