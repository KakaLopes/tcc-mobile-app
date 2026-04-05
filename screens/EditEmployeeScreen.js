import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../services/api";

export default function EditEmployeeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [employeeType, setEmployeeType] = useState("permanent");
  const [paymentType, setPaymentType] = useState("weekly");
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadEmployee();
  }, []);

  async function loadEmployee() {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const users = Array.isArray(response.data) ? response.data : [];
      const foundEmployee = users.find((item) => String(item.id) === String(id));

      if (!foundEmployee) {
        Alert.alert("Error", "Employee not found");
        router.back();
        return;
      }

      setEmployee(foundEmployee);
      setEmployeeType(
        foundEmployee.employee_type || foundEmployee.employeeType || "permanent"
      );
      setPaymentType(
        foundEmployee.payment_type || foundEmployee.paymentType || "weekly"
      );
      setActive(foundEmployee.active !== false);
    } catch (error) {
      console.log(
        "LOAD EMPLOYEE ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert("Error", "Unable to load employee");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const token = await AsyncStorage.getItem("token");

      await api.put(
        `/users/${id}`,
        {
          employee_type: employeeType,
          payment_type: paymentType,
          active,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Employee updated successfully");
      router.back();
    } catch (error) {
      console.log(
        "SAVE EMPLOYEE ERROR:",
        error?.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to update employee"
      );
    } finally {
      setSaving(false);
    }
  }

  function OptionButton({ label, selected, onPress }) {
    return (
      <TouchableOpacity
        style={[styles.optionButton, selected && styles.optionButtonSelected]}
        onPress={onPress}
      >
        <Text
          style={[styles.optionText, selected && styles.optionTextSelected]}
        >
          {label}
        </Text>
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Employee</Text>

      <View style={styles.card}>
        <Text style={styles.name}>{employee?.full_name}</Text>
        <Text style={styles.email}>{employee?.email}</Text>
        <Text style={styles.info}>Role: {employee?.role || "user"}</Text>
      </View>

      <Text style={styles.sectionTitle}>Employee Type</Text>
      <View style={styles.row}>
        <OptionButton
          label="Permanent"
          selected={employeeType === "permanent"}
          onPress={() => setEmployeeType("permanent")}
        />
        <OptionButton
          label="Temporary"
          selected={employeeType === "temporary"}
          onPress={() => setEmployeeType("temporary")}
        />
      </View>

      <Text style={styles.sectionTitle}>Payment Type</Text>
      <View style={styles.rowWrap}>
        <OptionButton
          label="Weekly"
          selected={paymentType === "weekly"}
          onPress={() => setPaymentType("weekly")}
        />
        <OptionButton
          label="Monthly"
          selected={paymentType === "monthly"}
          onPress={() => setPaymentType("monthly")}
        />
        <OptionButton
          label="Cash in hand"
          selected={paymentType === "cash_in_hand"}
          onPress={() => setPaymentType("cash_in_hand")}
        />
      </View>

      <Text style={styles.sectionTitle}>Status</Text>
      <View style={styles.row}>
        <OptionButton
          label="Active"
          selected={active === true}
          onPress={() => setActive(true)}
        />
        <OptionButton
          label="Inactive"
          selected={active === false}
          onPress={() => setActive(false)}
        />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving..." : "Save Changes"}
        </Text>
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
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
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
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: "#374151",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  optionText: {
    color: "#111827",
    fontWeight: "600",
  },
  optionTextSelected: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  backText: {
    textAlign: "center",
    fontWeight: "600",
  },
});