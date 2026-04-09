import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import MyLeaveRequestsScreen from "../screens/MyLeaveRequestsScreen";

export default function MyLeavesPage() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "my-leaves",
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                ← Back
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <MyLeaveRequestsScreen />
    </>
  );
}