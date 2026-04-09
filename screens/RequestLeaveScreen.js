import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import api from "../services/api";

export default function RequestLeaveScreen() {
  const router = useRouter();

  const [leaveType, setLeaveType] = useState("vacation");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState(null);
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

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) {
        Alert.alert("Error", "No file selected.");
        return;
      }

      setAttachment({
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType || "application/pdf",
      });
    } catch (error) {
      console.log("DOCUMENT PICKER ERROR:", error);
      Alert.alert("Error", "Unable to select document");
    }
  }

  function clearAttachment() {
    setAttachment(null);
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

      if (leaveType === "sick_leave" && !attachment) {
        Alert.alert(
          "Error",
          "Please upload a medical certificate for Sick Leave."
        );
        return;
      }

      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Token not found. Please log in again.");
        return;
      }

      let uploadedFile = null;

      if (attachment) {
        const base64 = await FileSystem.readAsStringAsync(attachment.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        console.log("BASE64 READY:", !!base64);

        const uploadResponse = await api.post(
          "/upload/base64",
          {
            fileName: attachment.name,
            mimeType: attachment.mimeType || "application/pdf",
            base64: base64,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("UPLOAD RESPONSE:", uploadResponse.data);
        uploadedFile = uploadResponse.data;
      }

      const payload = {
        leave_type: leaveType,
        start_date: apiStartDate,
        end_date: apiEndDate,
        reason,
        attachment_name: uploadedFile?.original_name || null,
        attachment_url: uploadedFile?.url || null,
        attachment_type: uploadedFile?.type || null,
      };

      console.log("LEAVE PAYLOAD:", payload);

      await api.post("/leave", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert("Success", "Leave request submitted successfully.");
      router.back();
    } catch (error) {
      console.log("REQUEST LEAVE FULL ERROR:", error);
      console.log("REQUEST LEAVE RESPONSE:", error?.response?.data);
      console.log("REQUEST LEAVE MESSAGE:", error?.message);

      Alert.alert(
        "Error",
        error?.response?.data?.error || error?.message || "Unable to submit leave request"
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

      {leaveType === "sick_leave" && (
        <>
          <Text style={styles.label}>Medical certificate</Text>

          <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
            <Text style={styles.uploadButtonText}>
              {attachment ? "Change Document" : "Upload Medical Certificate"}
            </Text>
          </TouchableOpacity>

          {attachment && (
            <View style={styles.attachmentCard}>
              <Text style={styles.attachmentTitle}>Selected file</Text>
              <Text style={styles.attachmentName}>{attachment.name}</Text>
              <Text style={styles.attachmentType}>
                {attachment.mimeType || "Unknown file type"}
              </Text>

              <TouchableOpacity
                style={styles.removeAttachmentButton}
                onPress={clearAttachment}
              >
                <Text style={styles.removeAttachmentText}>Remove file</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

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
    fontSize: 16,
  },
  optionActiveText: {
    color: "#2563eb",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  uploadButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },
  attachmentCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  attachmentTitle: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  attachmentName: {
    color: "#374151",
    marginBottom: 4,
  },
  attachmentType: {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 10,
  },
  removeAttachmentButton: {
    backgroundColor: "#fef2f2",
    padding: 10,
    borderRadius: 8,
  },
  removeAttachmentText: {
    color: "#dc2626",
    textAlign: "center",
    fontWeight: "600",
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
  disabledButton: {
    opacity: 0.7,
  },
});