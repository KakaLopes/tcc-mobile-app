import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import api from "../services/api";

export default function RequestLeaveScreen() {
  const router = useRouter();

  const [leaveType, setLeaveType] = useState("vacation");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  function formatDateInput(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 8);

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
  }

  function convertToApiDate(dateStr) {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (!match) return null;

    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  async function handleSubmit() {
    try {
      if (!leaveType || !startDate || !endDate) {
        Alert.alert(
          "Error",
          "Please fill in leave type, start date and end date."
        );
        return;
      }

      const apiStartDate = convertToApiDate(startDate);
      const apiEndDate = convertToApiDate(endDate);

      if (!apiStartDate || !apiEndDate) {
        Alert.alert("Error", "Please use the date format DD/MM/YYYY.");
        return;
      }

      if (new Date(apiEndDate) < new Date(apiStartDate)) {
        Alert.alert("Error", "End date cannot be earlier than start date.");
        return;
      }

      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Token not found. Please log in again.");
        return;
      }

      await api.post(
        "/leave",
        {
          leave_type: leaveType,
          start_date: apiStartDate,
          end_date: apiEndDate,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Leave request submitted successfully.");
      router.back();
    } catch (error) {
      console.log(
        "REQUEST LEAVE ERROR:",
        error?.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to submit leave request"
      );
    } finally {
      setLoading(false);
    }
  }

  function getOptionStyle(type) {
    return [
      styles.optionButton,
      leaveType === type && styles.optionButtonActive,
    ];
  }

  function getOptionTextStyle(type) {
    return leaveType === type ? styles.optionActiveText : styles.optionText;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Request Leave</Text>
      <Text style={styles.subtitle}>
        Vacation, day off, sick leave or other
      </Text>

      <Text style={styles.label}>Leave type</Text>

      <TouchableOpacity
        style={getOptionStyle("vacation")}
        onPress={() => setLeaveType("vacation")}
      >
        <Text style={getOptionTextStyle("vacation")}>Vacation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getOptionStyle("day_off")}
        onPress={() => setLeaveType("day_off")}
      >
        <Text style={getOptionTextStyle("day_off")}>Day Off</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getOptionStyle("sick_leave")}
        onPress={() => setLeaveType("sick_leave")}
      >
        <Text style={getOptionTextStyle("sick_leave")}>Sick Leave</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getOptionStyle("other")}
        onPress={() => setLeaveType("other")}
      >
        <Text style={getOptionTextStyle("other")}>Other</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Start date</Text>
      <TextInput
        placeholder="DD/MM/YYYY"
        placeholderTextColor="#9ca3af"
        value={startDate}
        onChangeText={(text) => setStartDate(formatDateInput(text))}
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>End date</Text>
      <TextInput
        placeholder="DD/MM/YYYY"
        placeholderTextColor="#9ca3af"
        value={endDate}
        onChangeText={(text) => setEndDate(formatDateInput(text))}
        style={styles.input}
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>Reason</Text>
      <TextInput
        placeholder="Optional reason"
        placeholderTextColor="#9ca3af"
        value={reason}
        onChangeText={setReason}
        style={[styles.input, styles.textArea]}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? "Submitting..." : "Submit Request"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f7fb",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "600",
  },
  optionButton: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  optionButtonActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  optionText: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "600",
  },
  optionActiveText: {
    color: "#2563eb",
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 16,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  backButtonText: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
});