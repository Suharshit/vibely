// ============================================================
// apps/mobile/screens/EditEventScreen.tsx
// ============================================================

import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useState, useEffect, useCallback } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "@/lib/supabase/client";
import type { AppStackParamList } from "@/navigation/types";

type EditRoute = RouteProp<AppStackParamList, "EditEvent">;
type Nav = NativeStackNavigationProp<AppStackParamList>;

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export default function EditEventScreen() {
  const route = useRoute<EditRoute>();
  const navigation = useNavigation<Nav>();
  const { eventId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: new Date(),
    upload_permission: "open" as "open" | "restricted",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  const fetchEvent = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();

    if (res.ok && data.event) {
      const ev = data.event;
      setForm({
        title: ev.title,
        description: ev.description ?? "",
        event_date: ev.event_date ? new Date(ev.event_date) : new Date(),
        upload_permission: ev.upload_permission ?? "open",
      });
      setCoverPreview(ev.cover_image_url ?? null);
    }
    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert("Title is required");
      return;
    }
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    const res = await fetch(`${API_BASE}/api/events/${eventId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        event_date: form.event_date.toISOString(),
        upload_permission: form.upload_permission,
      }),
    });

    setSaving(false);
    if (res.ok) {
      Alert.alert("Saved!", "Event updated successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      const data = await res.json();
      Alert.alert("Error", data.error ?? "Failed to save event");
    }
  };

  const handleCoverPick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setCoverPreview(asset.uri);
    setCoverUploading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const initRes = await fetch(`${API_BASE}/api/events/${eventId}/cover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content_type: "image/jpeg",
          file_size: asset.fileSize ?? 1000000,
        }),
      });
      const { upload_url, storage_key } = await initRes.json();

      await FileSystem.uploadAsync(upload_url, asset.uri, {
        httpMethod: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });

      await fetch(`${API_BASE}/api/events/${eventId}/cover/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ storage_key }),
      });

      Alert.alert("Cover updated!");
    } catch {
      Alert.alert("Error", "Failed to upload cover image");
      setCoverPreview(null);
    } finally {
      setCoverUploading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Event</Text>
      </View>

      {/* Cover image */}
      <TouchableOpacity
        style={s.coverArea}
        onPress={handleCoverPick}
        activeOpacity={0.85}
      >
        {coverPreview ? (
          <Image
            source={{ uri: coverPreview }}
            style={s.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[s.coverImage, s.coverPlaceholder]}>
            <Text style={s.coverPlaceholderText}>
              📷 {coverUploading ? "Uploading…" : "Tap to add cover"}
            </Text>
          </View>
        )}
        {coverUploading && (
          <View style={s.coverUploadOverlay}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      <View style={s.form}>
        {/* Title */}
        <View style={s.field}>
          <Text style={s.label}>Event title *</Text>
          <TextInput
            style={s.input}
            value={form.title}
            onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
            maxLength={100}
            placeholder="Birthday party, wedding, etc."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Description */}
        <View style={s.field}>
          <Text style={s.label}>Description</Text>
          <TextInput
            style={[s.input, s.inputMulti]}
            value={form.description}
            onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
            maxLength={500}
            placeholder="Optional details…"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Date picker */}
        <View style={s.field}>
          <Text style={s.label}>Event date</Text>
          <TouchableOpacity
            style={s.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={s.dateBtnText}>
              {form.event_date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.event_date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) setForm((f) => ({ ...f, event_date: date }));
              }}
            />
          )}
        </View>

        {/* Upload permission */}
        <View style={s.field}>
          <Text style={s.label}>Who can upload?</Text>
          <View style={s.permissionRow}>
            {(
              [
                { value: "open", label: "Everyone", desc: "Guests welcome" },
                {
                  value: "restricted",
                  label: "Members only",
                  desc: "Account required",
                },
              ] as const
            ).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  s.permCard,
                  form.upload_permission === opt.value && s.permCardActive,
                ]}
                onPress={() =>
                  setForm((f) => ({ ...f, upload_permission: opt.value }))
                }
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.permLabel,
                    form.upload_permission === opt.value && s.permLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text style={s.permDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[s.saveBtn, saving && s.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    backgroundColor: "#7c3aed",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 22, color: "#fff" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  coverArea: { height: 160, position: "relative" },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: {
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  coverPlaceholderText: { color: "#7c3aed", fontWeight: "600", fontSize: 15 },
  coverUploadOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  form: { padding: 16, gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputMulti: { height: 90, textAlignVertical: "top" },
  dateBtn: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
  },
  dateBtnText: { fontSize: 15, color: "#111827" },
  permissionRow: { flexDirection: "row", gap: 10 },
  permCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  permCardActive: { borderColor: "#7c3aed", backgroundColor: "#f5f3ff" },
  permLabel: { fontSize: 13, fontWeight: "700", color: "#374151" },
  permLabelActive: { color: "#7c3aed" },
  permDesc: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  saveBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
