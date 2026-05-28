import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function MyEntriesScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Token not found. Please log in again.");
        return;
      }

      const response = await api.get("/my-entries", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEntries(response.data || []);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to load history"
      );
    } finally {
      setLoading(false);
    }
  }

  function openAdjustModal(item) {
    setSelectedEntry(item);
    setNewTime("");
    setReason("");
    setModalVisible(true);
  }

  async function submitAdjustment() {
    try {
      if (!newTime || !/^\d{2}:\d{2}$/.test(newTime)) {
        Alert.alert("Error", "Please enter the time in HH:MM format.");
        return;
      }

      if (!reason.trim()) {
        Alert.alert("Error", "Please enter the adjustment reason.");
        return;
      }

      const token = await AsyncStorage.getItem("token");

      const originalDate = new Date(selectedEntry.clock_in);
      const [hours, minutes] = newTime.split(":");

      const newDate = new Date(originalDate);
      newDate.setHours(Number(hours));
      newDate.setMinutes(Number(minutes));
      newDate.setSeconds(0);

      await api.post(
        "/adjustments/request",
        {
          work_entry_id: selectedEntry.id,
          old_value: selectedEntry.clock_in,
          new_value: newDate.toISOString(),
          reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setModalVisible(false);
      Alert.alert("Success", "Adjustment request sent successfully.");
    } catch (error) {
      console.log("ADJUSTMENT ERROR:", error?.response?.data || error.message);

      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to send adjustment request"
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

  function formatDuration(minutes) {
    if (!minutes && minutes !== 0) return "—";

    const safeMinutes = Math.max(0, minutes);
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;

    return `${hours}h ${mins}min`;
  }

  function renderStatus(item) {
    if (!item.clock_out) {
      return <Text style={styles.statusOpen}>Status: work in progress</Text>;
    }

    return <Text style={styles.statusClosed}>Status: completed</Text>;
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <Text style={styles.date}>📅 {formatDate(item.clock_in)}</Text>

        <Text style={styles.label}>
          Clock-in: <Text style={styles.value}>{formatTime(item.clock_in)}</Text>
        </Text>

        <Text style={styles.label}>
          Clock-out:{" "}
          <Text style={styles.value}>
            {item.clock_out ? formatTime(item.clock_out) : "Open"}
          </Text>
        </Text>

        <Text style={styles.label}>
          Total:{" "}
          <Text style={styles.value}>
            {item.clock_out
              ? formatDuration(item.duration_minutes)
              : "In progress"}
          </Text>
        </Text>

        {renderStatus(item)}

        {item.note ? (
          <Text style={styles.note}>
            Note: <Text style={styles.value}>{item.note}</Text>
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => openAdjustModal(item)}
        >
          <Text style={styles.adjustText}>Request Adjustment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Work History</Text>

      <TouchableOpacity style={styles.button} onPress={loadEntries}>
        <Text style={styles.buttonText}>
          {loading ? "Updating..." : "Refresh History"}
        </Text>
      </TouchableOpacity>

      {entries.length === 0 && !loading ? (
        <Text style={styles.empty}>No records found.</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Request Adjustment</Text>

            <Text style={styles.inputLabel}>New time HH:MM</Text>
            <TextInput
              style={styles.input}
              placeholder="Example: 09:30"
              value={newTime}
              onChangeText={setNewTime}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Reason</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the reason"
              value={reason}
              onChangeText={setReason}
              multiline
            />

            <TouchableOpacity style={styles.submitButton} onPress={submitAdjustment}>
              <Text style={styles.buttonText}>Submit Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb", padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  date: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#111827" },
  label: { fontSize: 15, marginBottom: 5, color: "#374151" },
  value: { fontWeight: "600", color: "#111827" },
  note: { marginTop: 8, fontSize: 14, color: "#4b5563" },
  statusOpen: { marginTop: 10, color: "#d97706", fontWeight: "bold" },
  statusClosed: { marginTop: 10, color: "#15803d", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 30, fontSize: 16, color: "#6b7280" },
  adjustButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
  },
  adjustText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  inputLabel: {
    fontWeight: "bold",
    marginBottom: 6,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  cancelButton: {
    padding: 12,
    marginTop: 8,
  },
  cancelText: {
    textAlign: "center",
    color: "#ef4444",
    fontWeight: "bold",
  },
});