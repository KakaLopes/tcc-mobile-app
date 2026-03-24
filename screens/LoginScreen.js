import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Please enter email and password");
        return;
      }

      setLoading(true);

      const response = await api.post("/login", {
        email,
        password,
      });

      if (response.data?.token) {
        await AsyncStorage.setItem("token", response.data.token);
      }

      if (response.data?.user) {
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      }

      Alert.alert("Success", "Login successful");
      router.replace("/");
    } catch (error) {
      console.log("LOGIN ERROR:", error?.response?.data || error.message);

      Alert.alert(
        "Error",
        error?.response?.data?.error || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome TEST 👋</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {loading ? "Signing in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
  onPress={() => router.push("/register")}
  style={styles.registerLinkContainer}
>
  <Text style={styles.registerLinkText}>
    Don't have an account? Create one
  </Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f7fb",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerLinkContainer: {
  marginTop: 20,
  alignItems: "center",
},

registerLinkText: {
  color: "red",
  fontSize: 16,
  fontWeight: "bold",
},
  linkText: {
    marginTop: 16,
    textAlign: "center",
    color: "#2563eb",
    fontWeight: "600",
  },
});