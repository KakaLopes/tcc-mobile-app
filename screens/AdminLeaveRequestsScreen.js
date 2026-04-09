import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
export default function AdminLeaveRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  async function loadLeaveRequests() {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await api.get("/leaves", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response.data || []);
    } catch (error) {
      console.log(
        "LOAD LEAVES ERROR:",
        error?.response?.data || error.message
      );

      Alert.alert("Error", "Unable to load leave requests");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const token = await AsyncStorage.getItem("token");

      await api.put(
        `/leave/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Success",
        status === "approved"
          ? "Leave request approved"
          : "Leave request rejected"
      );

      loadLeaveRequests();
    } catch (error) {
      console.log(
        "UPDATE LEAVE STATUS ERROR:",
        error?.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error?.response?.data?.error || "Unable to update leave request"
      );
    }
  }

async function handleViewDocument(item) {
  try {
    if (!item?.attachment_url) {
      Alert.alert("Info", "No document available for this request.");
      return;
    }

    const fileName = item.attachment_name || "medical-certificate.pdf";
    const safeFileName = fileName.endsWith(".pdf")
      ? fileName
      : `${fileName}.pdf`;

    const localUri = `${FileSystem.cacheDirectory}${safeFileName}`;

    console.log("DOWNLOAD URL:", item.attachment_url);
    console.log("LOCAL URI:", localUri);

    const downloadResult = await FileSystem.downloadAsync(
      item.attachment_url,
      localUri
    );

    console.log("DOWNLOAD RESULT:", downloadResult);

    if (downloadResult.status !== 200) {
      Alert.alert(
        "Error",
        `Unable to download document. Status: ${downloadResult.status}`
      );
      return;
    }

    const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
    console.log("DOWNLOADED FILE INFO:", fileInfo);

    if (!fileInfo.exists) {
      Alert.alert("Error", "Downloaded file not found on device.");
      return;
    }

    const sharingAvailable = await Sharing.isAvailableAsync();

    if (!sharingAvailable) {
      Alert.alert("Error", "Sharing is not available on this device.");
      return;
    }

    await Sharing.shareAsync(downloadResult.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Open medical certificate",
      UTI: "com.adobe.pdf",
    });
  } catch (error) {
    console.log("OPEN DOCUMENT ERROR:", error);
    Alert.alert(
      "Error",
      error?.message || "Unable to download document."
    );
  }
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

  function renderStatus(status) {
    if (status === "approved") return styles.statusApproved;
    if (status === "rejected") return styles.statusRejected;
    return styles.statusPending;
  }

  function formatLeaveType(type) {
    if (!type) return "-";

    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function hasAttachment(item) {
    return !!item.attachment_name;
  }

  function renderItem({ item }) {
    const showMedicalCertificate =
      item.leave_type === "sick_leave" && hasAttachment(item);

    return (
      <View style={styles.card}>
        <Text style={styles.name}>
          {item.user?.full_name || "Unknown employee"}
        </Text>
        <Text style={styles.email}>{item.user?.email || "-"}</Text>

        <Text style={styles.info}>Type: {formatLeaveType(item.leave_type)}</Text>
        <Text style={styles.info}>Start: {formatDate(item.start_date)}</Text>
        <Text style={styles.info}>End: {formatDate(item.end_date)}</Text>
        <Text style={styles.info}>
          Days: {calculateDays(item.start_date, item.end_date)}
        </Text>
        <Text style={styles.info}>Reason: {item.reason || "-"}</Text>

        {showMedicalCertificate && (
          <View style={styles.attachmentBox}>
            <Text style={styles.attachmentTitle}>
              Medical certificate attached
            </Text>
            <Text style={styles.attachmentInfo}>
              File: {item.attachment_name}
            </Text>
            <Text style={styles.attachmentInfo}>
              Type: {item.attachment_type || "Unknown"}
            </Text>

            <TouchableOpacity
              style={styles.viewDocumentButton}
              onPress={() => handleViewDocument(item)}
            >
              <Text style={styles.viewDocumentText}>View document</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.status, renderStatus(item.status)]}>
          Status: {formatLeaveType(item.status)}
        </Text>

        {item.status === "pending" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => updateStatus(item.id, "approved")}
            >
              <Text style={styles.actionText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => updateStatus(item.id, "rejected")}
            >
              <Text style={styles.actionText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave Requests</Text>

      {requests.length === 0 ? (
        <Text style={styles.empty}>No leave requests found.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
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
    marginBottom: 20,
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
    marginTop: 40,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
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
    marginBottom: 10,
  },
  info: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 4,
  },
  attachmentBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  attachmentTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1d4ed8",
    marginBottom: 6,
  },
  attachmentInfo: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 2,
  },
  viewDocumentButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  viewDocumentText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
  },
  status: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 15,
  },
  statusPending: {
    color: "#d97706",
  },
  statusApproved: {
    color: "#15803d",
  },
  statusRejected: {
    color: "#dc2626",
  },
  actions: {
    flexDirection: "row",
    marginTop: 14,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 10,
    marginRight: 6,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 10,
    marginLeft: 6,
  },
  actionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },
});