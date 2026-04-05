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
import api from "../services/api";

export default function AdminEmployeesScreen() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Token not found. Please log in again.");
        return;
      }

      const response = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const users = Array.isArray(response.data) ? response.data : [];
      setEmployees(users);
    } catch (error) {
      console.log(
        "LOAD EMPLOYEES ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert("Error", "Unable to load employees");
    } finally {
      setLoading(false);
    }
  }

  function getEmployeeType(employee) {
    return employee?.employee_type || employee?.employeeType || "Not defined";
  }

  function getPaymentType(employee) {
    return employee?.payment_type || employee?.paymentType || "Not defined";
  }

  function getStatus(employee) {
    if (employee?.active === false) return "Inactive";
    return "Active";
  }
function getStatus(employee) {
  return employee?.active === false ? "Inactive" : "Active";
}

function getStatusStyle(employee) {
  return employee?.active === false
    ? styles.badgeInactive
    : styles.badgeActive;
}

function getEmployeeType(employee) {
  return employee?.employee_type || employee?.employeeType || "Not defined";
}

function getPaymentType(employee) {
  return employee?.payment_type || employee?.paymentType || "Not defined";
}

function isCashInHand(employee) {
  return (
    employee?.cash_in_hand === true ||
    employee?.payment_type === "cash_in_hand" ||
    employee?.paymentType === "cash_in_hand"
  );
}
 function renderItem({ item }) {
  const cashInHand = isCashInHand(item);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/edit-employee",
          params: { id: item.id },
        })
      }
    >
      <Text style={styles.name}>{item.full_name || "Unnamed employee"}</Text>
      <Text style={styles.email}>{item.email || "-"}</Text>

      <View style={styles.badgesRow}>
        <View style={[styles.badge, getStatusStyle(item)]}>
          <Text style={styles.badgeText}>{getStatus(item)}</Text>
        </View>

        {cashInHand && (
          <View style={[styles.badge, styles.badgeCash]}>
            <Text style={styles.badgeText}>Cash in hand</Text>
          </View>
        )}
      </View>

      <Text style={styles.info}>Role: {item.role || "employee"}</Text>
      <Text style={styles.info}>Employee type: {getEmployeeType(item)}</Text>
      <Text style={styles.info}>Payment type: {getPaymentType(item)}</Text>

      <Text style={styles.editHint}>Tap to edit</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Employees</Text>

      <View style={styles.summaryCard}>
        <Text>Total employees: {employees.length}</Text>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadEmployees}>
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
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 16,
  },
  badgesRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 10,
},

badge: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 999,
  alignSelf: "flex-start",
},

badgeActive: {
  backgroundColor: "#dcfce7",
},

badgeInactive: {
  backgroundColor: "#fee2e2",
},

badgeCash: {
  backgroundColor: "#fef3c7",
},

badgeText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#111827",
},
  summaryCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
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
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 3,
  },
  editHint: {
    marginTop: 8,
    color: "#2563eb",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
  },
});