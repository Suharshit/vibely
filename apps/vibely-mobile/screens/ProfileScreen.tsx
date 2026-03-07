// ============================================================
// apps/mobile/screens/ProfileScreen.tsx
// ============================================================

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import * as FileSystem from "expo-file-system/legacy";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}
interface Stats {
  events: number;
  photos_uploaded: number;
  vault_size: number;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch(`${API_BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setProfile(data.profile);
    setStats(data.stats);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEdit = () => {
    setForm({ name: profile?.name ?? "", bio: profile?.bio ?? "" });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch(`${API_BASE}/api/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setProfile(data.profile);
      setIsEditing(false);
      Alert.alert("Profile updated!");
    } else Alert.alert("Error", data.error ?? "Failed to update");
  };

  const handleAvatarPick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo access in Settings."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    setAvatarUploading(true);
    try {
      const initRes = await fetch(`${API_BASE}/api/profile/avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content_type: "image/jpeg",
          file_size: asset.fileSize ?? 500000,
        }),
      });
      const { upload_url, storage_key } = await initRes.json();

      await FileSystem.uploadAsync(upload_url, asset.uri, {
        httpMethod: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });

      const completeRes = await fetch(
        `${API_BASE}/api/profile/avatar/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ storage_key }),
        }
      );
      const completeData = await completeRes.json();
      if (completeRes.ok) setProfile(completeData.profile);
      else Alert.alert("Error", "Failed to save avatar");
    } catch {
      Alert.alert("Error", "Avatar upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (isLoading)
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  if (!profile) return null;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Avatar */}
      <View style={s.avatarSection}>
        <TouchableOpacity
          onPress={handleAvatarPick}
          disabled={avatarUploading}
          activeOpacity={0.8}
        >
          <View style={s.avatarWrap}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarPlaceholder]}>
                <Text style={s.avatarInitial}>
                  {profile.name?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
            <View style={s.avatarBadge}>
              {avatarUploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.avatarBadgeText}>✎</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {isEditing ? (
          <View style={s.editForm}>
            <TextInput
              style={s.input}
              value={form.name}
              onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
              placeholder="Name"
              maxLength={100}
            />
            <TextInput
              style={[s.input, s.inputMultiline]}
              value={form.bio}
              onChangeText={(t) => setForm((f) => ({ ...f, bio: t }))}
              placeholder="Bio (optional)"
              maxLength={300}
              multiline
              numberOfLines={3}
            />
            <View style={s.row}>
              <TouchableOpacity
                style={[s.btn, s.btnPrimary]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.btnPrimaryText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, s.btnSecondary]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={s.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={s.name}>{profile.name}</Text>
            <Text style={s.email}>{profile.email}</Text>
            {profile.bio ? <Text style={s.bio}>{profile.bio}</Text> : null}
            <TouchableOpacity
              style={[s.btn, s.btnSecondary, { marginTop: 12 }]}
              onPress={handleEdit}
            >
              <Text style={s.btnSecondaryText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Stats */}
      {stats && (
        <View style={s.statsRow}>
          {[
            { label: "Events", value: stats.events },
            { label: "Photos", value: stats.photos_uploaded },
            { label: "Vault", value: stats.vault_size },
          ].map((stat) => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Sign out */}
      <TouchableOpacity
        style={s.signOutBtn}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 24, paddingBottom: 48 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarWrap: { position: "relative", marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 20 },
  avatarPlaceholder: {
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { fontSize: 28, fontWeight: "700", color: "#7c3aed" },
  avatarBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f9fafb",
  },
  avatarBadgeText: { color: "#fff", fontSize: 12 },
  name: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 2 },
  email: { fontSize: 14, color: "#9ca3af", marginBottom: 6 },
  bio: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
    marginTop: 8,
  },
  editForm: { width: "100%", gap: 10, marginTop: 8 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnPrimary: { backgroundColor: "#7c3aed" },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  btnSecondary: { backgroundColor: "#f3f4f6" },
  btnSecondaryText: { color: "#374151", fontWeight: "600", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  statValue: { fontSize: 22, fontWeight: "700", color: "#111827" },
  statLabel: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  signOutBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fee2e2",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: { color: "#ef4444", fontWeight: "600", fontSize: 14 },
});
