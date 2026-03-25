import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useRouter, useLocalSearchParams } from "expo-router";

const VALID_QR = "COMPANY_CLOCK_TOKEN_ABC123";

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { action } = useLocalSearchParams(); // clock-in ou clock-out

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);

    if (data !== VALID_QR) {
      Alert.alert("Invalid QR", "This QR code is not valid.");
      router.back();
      return;
    }

    // volta para Home com sucesso
    router.replace({
      pathname: "/",
      params: { qrValid: "true", action },
    });
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Scan company QR code</Text>

      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    color: "#fff",
    fontSize: 18,
    zIndex: 1,
  },
});