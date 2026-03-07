// ============================================================
// apps/mobile/screens/GuestUploadScreen.tsx
// ============================================================
// Mobile equivalent of the guest upload web page.
// Guests arrive here via deep link: vibely://guest/{inviteToken}
// or by tapping "Upload as Guest" on the JoinEvent screen.
// ============================================================

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePhotos } from "@/hooks/usePhotos";
import { PhotoUploadButton } from "@/components/photos/PhotoUploadButton";
import { UploadProgressList } from "@/components/photos/UploadProgressList";
import type { AppStackParamList } from "@/navigation/types";

type GuestRoute = RouteProp<AppStackParamList, "GuestUpload">;
type Nav = NativeStackNavigationProp<AppStackParamList>;

const STORAGE_KEY = "vibely_guest_session";

interface GuestSession {
  session_token: string;
  display_name: string;
  event_id: string;
  event_title: string;
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function GuestUploadScreen() {
  const route = useRoute<GuestRoute>();
  const navigation = useNavigation<Nav>();
  const { inviteToken } = route.params;

  const [phase, setPhase] = useState<
    "loading" | "name-entry" | "uploading" | "error"
  >("loading");
  const [session, setSession] = useState<GuestSession | null>(null);
  const [eventPreview, setEventPreview] = useState<any>(null);
  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      // Check stored guest session
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed: GuestSession = JSON.parse(stored);
          const res = await fetch(
            `${API_BASE}/api/guest/session/${parsed.session_token}`
          );
          if (res.ok) {
            setSession(parsed);
            setPhase("uploading");
            return;
          }
        } catch {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }

      // Fetch event preview using invite token
      try {
        const res = await fetch(
          `${API_BASE}/api/events/by-token/${inviteToken}`
        );
        if (!res.ok) {
          setErrorMsg("This invite link is invalid or has expired.");
          setPhase("error");
          return;
        }
        const data = await res.json();
        setEventPreview(data.event);
        setPhase("name-entry");
      } catch {
        setErrorMsg("Could not load event. Check your connection.");
        setPhase("error");
      }
    };
    init();
  }, [inviteToken]);

  const handleStart = async () => {
    if (!nameInput.trim() || !eventPreview) return;
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/guest/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventPreview.id,
          display_name: nameInput.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to start session.");
        return;
      }

      const newSession: GuestSession = {
        session_token: data.session_token,
        display_name: data.display_name,
        event_id: data.event_id,
        event_title: data.event_title,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setPhase("uploading");
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { uploads, uploadPhoto } = usePhotos(session?.event_id ?? "");
  const doneCount = uploads.filter((u) => u.status === "done").length;

  // ── Loading ──────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>🔗</Text>
        <Text style={styles.errorTitle}>Link unavailable</Text>
        <Text style={styles.errorMsg}>{errorMsg}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Name Entry ───────────────────────────────────────────────
  if (phase === "name-entry" && eventPreview) {
    return (
      <KeyboardAvoidingView
        style={styles.bg}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.emoji}>📸</Text>
          <Text style={styles.cardTitle}>{eventPreview.title}</Text>
          {eventPreview.host && (
            <Text style={styles.cardSub}>
              hosted by {eventPreview.host.name}
            </Text>
          )}

          <Text style={styles.label}>What's your name?</Text>
          <TextInput
            style={styles.input}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="e.g. Maria"
            placeholderTextColor="#9ca3af"
            maxLength={50}
            autoFocus
            returnKeyType="go"
            onSubmitEditing={handleStart}
          />
          <Text style={styles.inputHint}>
            Your name will appear on photos you upload
          </Text>

          {errorMsg ? <Text style={styles.errorInline}>{errorMsg}</Text> : null}

          <TouchableOpacity
            style={[
              styles.btn,
              (!nameInput.trim() || isSubmitting) && styles.btnDisabled,
            ]}
            onPress={handleStart}
            disabled={!nameInput.trim() || isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Start uploading →</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.ctaText}>
            Have an account?{" "}
            <Text
              style={styles.ctaLink}
              onPress={() => navigation.navigate("Login" as any)}
            >
              Sign in
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Uploading ────────────────────────────────────────────────
  if (phase === "uploading" && session) {
    return (
      <ScrollView
        style={styles.bgScroll}
        contentContainerStyle={styles.bgScrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.emoji}>👋</Text>
          <Text style={styles.cardTitle}>Hey {session.display_name}!</Text>
          <Text style={styles.cardSub}>
            Upload your photos from {session.event_title}
          </Text>

          <UploadProgressList uploads={uploads} />

          <PhotoUploadButton
            eventId={session.event_id}
            onUpload={uploadPhoto}
            guestToken={session.session_token}
          />

          {doneCount > 0 && (
            <Text style={styles.successText}>
              ✓ {doneCount} photo{doneCount !== 1 ? "s" : ""} uploaded
            </Text>
          )}

          <View style={styles.signupCta}>
            <Text style={styles.ctaText}>
              Want to save photos to your vault?
            </Text>
            <Text
              style={styles.ctaLink}
              onPress={() => navigation.navigate("Register" as any)}
            >
              Create a free account →
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#f5f3ff",
    justifyContent: "center",
    padding: 24,
  },
  bgScroll: { flex: 1, backgroundColor: "#f5f3ff" },
  bgScrollContent: { padding: 24, justifyContent: "center", flexGrow: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emoji: { fontSize: 36, marginBottom: 12 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  cardSub: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
    marginBottom: 24,
  },

  label: {
    alignSelf: "flex-start",
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fafafa",
  },
  inputHint: {
    alignSelf: "flex-start",
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
    marginBottom: 16,
  },

  btn: {
    width: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  errorInline: { fontSize: 13, color: "#ef4444", marginBottom: 8 },

  ctaText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 16,
    textAlign: "center",
  },
  ctaLink: { color: "#7c3aed", fontWeight: "600" },

  errorEmoji: { fontSize: 36, marginBottom: 12 },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  errorMsg: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
  },
  backLink: { fontSize: 14, color: "#7c3aed", fontWeight: "600" },

  successText: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    marginTop: 16,
  },
  signupCta: { marginTop: 24, alignItems: "center", gap: 4 },
});
