// ============================================================
// apps/mobile/screens/DashboardScreen.tsx
// ============================================================
// Temporary placeholder dashboard — Phase 8 will replace this
// with a full event list. For now it just confirms auth works
// and provides a sign out button.
// ============================================================

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're in! 🎉</Text>
      <Text style={styles.subtitle}>
        Welcome, {user?.user_metadata?.full_name ?? user?.email}
      </Text>
      <Text style={styles.note}>Dashboard coming in Phase 8.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={signOut}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f9fafb",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  note: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
});
