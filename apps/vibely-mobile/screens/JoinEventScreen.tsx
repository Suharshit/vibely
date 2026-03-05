// ============================================================
// apps/mobile/screens/JoinEventScreen.tsx
// ============================================================
// Lets users join an event by entering an invite token manually.
// In production, deep links from QR scans would automatically
// navigate here with the token pre-filled (Phase 15 setup).
// For now this handles manual entry and is used when the app
// opens from a deep link: vibely://join/TOKEN12345
// ============================================================

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEvents } from "@/hooks/useEvents";
import type { AppStackParamList } from "@/navigation/types";

type JoinRoute = RouteProp<AppStackParamList, "JoinEvent">;
type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function JoinEventScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<JoinRoute>();
  const { joinEvent } = useEvents();

  // Token may come from a deep link param or the user types it
  const [token, setToken] = useState(
    (route.params as { token?: string })?.token ?? ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    const cleanToken = token.trim().toUpperCase();

    if (cleanToken.length !== 12) {
      Alert.alert("Invalid token", "Invite tokens are 12 characters long.");
      return;
    }

    setIsLoading(true);
    const result = await joinEvent(cleanToken);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert(
        "Could not join",
        result.error ?? "Please check the token and try again."
      );
      return;
    }

    if (result.alreadyMember && result.event) {
      Alert.alert(
        "Already a member",
        `You're already part of "${result.event.title}".`,
        [
          {
            text: "View event",
            onPress: () =>
              navigation.replace("EventDetail", { eventId: result.event.id }),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    if (result.event) {
      navigation.replace("EventDetail", { eventId: result.event.id });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Join an Event</Text>
        <Text style={styles.subtitle}>
          Enter the 12-character invite code from a Vibely event link.
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={(t) => setToken(t.toUpperCase())}
            placeholder="XXXXXXXXXXXXXX"
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
            returnKeyType="go"
            onSubmitEditing={handleJoin}
          />
          <Text style={styles.charCount}>{token.length}/12</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, isLoading && styles.btnDisabled]}
          onPress={handleJoin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnText}>Join Event</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  inner: { flex: 1, padding: 24, paddingTop: 56, justifyContent: "flex-start" },
  backBtn: { marginBottom: 32 },
  backText: { fontSize: 14, color: "#7c3aed", fontWeight: "500" },
  title: { fontSize: 26, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 8, lineHeight: 20 },

  inputWrapper: { marginTop: 32, position: "relative" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 22,
    letterSpacing: 4,
    color: "#111827",
    fontWeight: "600",
    textAlign: "center",
  },
  charCount: {
    position: "absolute",
    right: 14,
    bottom: 10,
    fontSize: 11,
    color: "#9ca3af",
  },

  btn: {
    marginTop: 24,
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
