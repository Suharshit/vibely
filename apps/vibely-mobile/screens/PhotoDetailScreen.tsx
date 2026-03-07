// ============================================================
// apps/mobile/screens/PhotoDetailScreen.tsx
// ============================================================
// Note: Export both screens from separate files in production.
// Combined here for brevity — split at your discretion.
// ============================================================

import {
  View as RNView,
  Text as RNText,
  Image as RNImage,
  ScrollView as RNScrollView,
  TouchableOpacity as RNTouchableOpacity,
  StyleSheet as RNStyleSheet,
  Alert as RNAlert,
  ActivityIndicator as RNActivityIndicator,
  Share,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem2 from "expo-file-system/legacy";
import { useState, useEffect } from "react";
import { useRoute, useNavigation as useNav2 } from "@react-navigation/native";
import type { RouteProp as RP } from "@react-navigation/native";
import type { NativeStackNavigationProp as NNSP } from "@react-navigation/native-stack";
import { supabase as sb } from "@/lib/supabase/client";
import type { AppStackParamList } from "@/navigation/types";

type PDRoute = RP<AppStackParamList, "PhotoDetail">;
type PDNav = NNSP<AppStackParamList>;

const API2 = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

function formatDate2(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PhotoDetailScreen() {
  const route = useRoute<PDRoute>();
  const navigation = useNav2<PDNav>();
  const { photoId } = route.params;

  const [photo, setPhoto] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API2}/api/photos/${photoId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPhoto(data.photo);
        setSaved(data.photo.saved_by_me);
      }
      setIsLoading(false);
    };
    load();
  }, [photoId]);

  const handleSave = async () => {
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (!session) return;
    const method = saved ? "DELETE" : "POST";
    await fetch(`${API2}/api/photos/${photoId}/save`, {
      method,
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setSaved(!saved);
  };

  const handleDownload = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      RNAlert.alert(
        "Permission required",
        "Allow photo library access to save photos."
      );
      return;
    }

    setDownloading(true);
    try {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API2}/api/photos/${photoId}/download`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const { download_url } = await res.json();

      const ext = photo.original_filename.split(".").pop() ?? "jpg";
      const localUri = `${FileSystem2.cacheDirectory}vibely_${photoId}.${ext}`;
      const downloadResult = await FileSystem2.downloadAsync(
        download_url,
        localUri
      );

      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
      RNAlert.alert("Saved!", "Photo saved to your camera roll.");
    } catch {
      RNAlert.alert("Error", "Failed to download photo.");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <RNView style={pd.centered}>
        <RNActivityIndicator size="large" color="#7c3aed" />
      </RNView>
    );
  }
  if (!photo) {
    return (
      <RNView style={pd.centered}>
        <RNText style={pd.errorText}>Photo not found</RNText>
        <RNTouchableOpacity onPress={() => navigation.goBack()}>
          <RNText style={pd.backLink}>Go back</RNText>
        </RNTouchableOpacity>
      </RNView>
    );
  }

  const uploaderName =
    photo.uploader?.name ?? photo.guest_uploader?.display_name ?? "Unknown";

  return (
    <RNScrollView style={pd.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <RNView style={pd.header}>
        <RNTouchableOpacity
          onPress={() => navigation.goBack()}
          style={pd.backBtn}
        >
          <RNText style={pd.backBtnText}>←</RNText>
        </RNTouchableOpacity>
        <RNText style={pd.headerTitle} numberOfLines={1}>
          {photo.original_filename}
        </RNText>
      </RNView>

      {/* Preview image */}
      <RNImage
        source={{ uri: photo.preview_url }}
        style={pd.previewImage}
        resizeMode="contain"
      />

      {/* Actions */}
      <RNView style={pd.actionsRow}>
        <RNTouchableOpacity
          style={[pd.actionBtn, saved && pd.actionBtnSaved]}
          onPress={handleSave}
        >
          <RNText style={[pd.actionBtnText, saved && pd.actionBtnTextSaved]}>
            {saved ? "🔖 Saved" : "🔖 Save to Vault"}
          </RNText>
        </RNTouchableOpacity>

        <RNTouchableOpacity
          style={pd.actionBtn}
          onPress={handleDownload}
          disabled={downloading}
        >
          <RNText style={pd.actionBtnText}>
            {downloading ? "Saving…" : "⬇ Download"}
          </RNText>
        </RNTouchableOpacity>

        <RNTouchableOpacity
          style={pd.actionBtn}
          onPress={() =>
            Share.share({
              message: `Check out this photo from Vibely!`,
              url: photo.preview_url,
            })
          }
        >
          <RNText style={pd.actionBtnText}>↗ Share</RNText>
        </RNTouchableOpacity>
      </RNView>

      {/* Meta */}
      <RNView style={pd.meta}>
        <MetaRow label="Uploaded by" value={uploaderName} />
        <MetaRow label="Date" value={formatDate2(photo.created_at)} />
        {photo.event && (
          <RNTouchableOpacity
            onPress={() =>
              navigation.navigate("EventDetail", { eventId: photo.event.id })
            }
          >
            <RNView style={pd.metaRow}>
              <RNText style={pd.metaLabel}>Event</RNText>
              <RNText style={[pd.metaValue, pd.metaLink]}>
                {photo.event.title} →
              </RNText>
            </RNView>
          </RNTouchableOpacity>
        )}
        <MetaRow label="File" value={photo.original_filename} />
        <MetaRow
          label="Size"
          value={`${(photo.file_size / 1024 / 1024).toFixed(1)} MB`}
        />
      </RNView>
    </RNScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <RNView style={pd.metaRow}>
      <RNText style={pd.metaLabel}>{label}</RNText>
      <RNText style={pd.metaValue} numberOfLines={2}>
        {value}
      </RNText>
    </RNView>
  );
}

const pd = RNStyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: { color: "#9ca3af", fontSize: 15, marginBottom: 12 },
  backLink: { color: "#7c3aed", fontWeight: "600", fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backBtnText: { fontSize: 22, color: "#fff" },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  previewImage: { width: "100%", height: 340, backgroundColor: "#000" },
  actionsRow: { flexDirection: "row", gap: 8, padding: 16 },
  actionBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionBtnSaved: { backgroundColor: "rgba(245,158,11,0.2)" },
  actionBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  actionBtnTextSaved: { color: "#fbbf24" },
  meta: {
    backgroundColor: "rgba(255,255,255,0.05)",
    margin: 16,
    borderRadius: 16,
    padding: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  metaLabel: { fontSize: 12, color: "rgba(255,255,255,0.4)", flex: 1 },
  metaValue: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    flex: 2,
    textAlign: "right",
  },
  metaLink: { color: "#a78bfa" },
});
