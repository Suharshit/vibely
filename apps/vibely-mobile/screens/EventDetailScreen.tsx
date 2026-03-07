/* eslint-disable @typescript-eslint/no-unused-vars */
// ============================================================
// apps/mobile/screens/EventDetailScreen.tsx  (updated Phase 9)
// ============================================================

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useState, useEffect, useCallback } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { supabase } from "@/lib/supabase/client";
import { usePhotos } from "@/hooks/usePhotos";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import { PhotoUploadButton } from "@/components/photos/PhotoUploadButton";
import { UploadProgressList } from "@/components/photos/UploadProgressList";
import { formatEventDate, relativeTime, isEventExpired } from "@shared/utils";
import type { AppStackParamList } from "@/navigation/types";

type EventDetailRoute = RouteProp<AppStackParamList, "EventDetail">;
type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function EventDetailScreen() {
  const route = useRoute<EventDetailRoute>();
  const navigation = useNavigation<Nav>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<any>(null);
  const [userRole, setUserRole] = useState("");
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [eventError, setEventError] = useState("");

  const {
    photos,
    isLoading: photosLoading,
    hasMore,
    uploads,
    uploadPhoto,
    loadMore,
    savePhoto,
    unsavePhoto,
    deletePhoto,
  } = usePhotos(eventId);

  const fetchEvent = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: eventData, error } = await supabase
        .from("events")
        .select(
          `
          id, title, description, host_id, invite_token,
          event_date, expires_at, status, upload_permission,
          host:users!host_id ( id, name, avatar_url ),
          event_members (
            id, role, is_guest,
            user:users ( id, name, avatar_url )
          )
        `
        )
        .eq("id", eventId)
        .single();

      if (error) throw error;

      const me = eventData?.event_members?.find(
        (m: any) => m.user?.id === user.id
      );
      setUserRole(me?.role ?? "");
      setEvent(eventData);
    } catch (err: any) {
      setEventError(err?.message ?? "Failed to load event");
    } finally {
      setIsLoadingEvent(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const inviteUrl = event
    ? `https://vibely.app/join/${event.invite_token}`
    : "";

  const handleShare = async () => {
    await Share.share({
      title: event?.title,
      message: `Join "${event?.title}" on Vibely!\n\n${inviteUrl}`,
      url: inviteUrl,
    });
  };

  if (isLoadingEvent) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (eventError || !event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{eventError || "Event not found"}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const expired = isEventExpired(event.expires_at);
  const canUpload = !expired && event.status === "active";

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {event.title}
        </Text>
        {/* Upload icon in header for quick access */}
        {canUpload && (
          <PhotoUploadButton
            eventId={eventId}
            onUpload={uploadPhoto}
            disabled={false}
          />
        )}
      </View>

      {/* Event meta */}
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View
            style={[
              styles.badge,
              expired ? styles.badgeExpired : styles.badgeActive,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                expired ? styles.badgeTextExpired : styles.badgeTextActive,
              ]}
            >
              {expired ? "Ended" : "Active"}
            </Text>
          </View>
        </View>
        <Text style={styles.eventDate}>
          {formatEventDate(event.event_date)}
        </Text>
        {event.description ? (
          <Text style={styles.eventDesc}>{event.description}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>By {event.host?.name}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>
            {event.event_members?.length ?? 0} members
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>
            Expires {relativeTime(event.expires_at)}
          </Text>
        </View>
      </View>

      {/* Invite / QR */}
      {!expired && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Invite Guests</Text>
          <View style={styles.qrWrapper}>
            <QRCode
              value={inviteUrl}
              size={160}
              color="#111827"
              backgroundColor="#ffffff"
            />
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Share Invite Link</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upload progress */}
      <UploadProgressList uploads={uploads} />

      {/* Expired notice */}
      {expired && (
        <View style={styles.expiredNotice}>
          <Text style={styles.expiredText}>
            This event has ended. Save photos to your vault before they expire.
          </Text>
        </View>
      )}

      {/* Photo Gallery */}
      <View style={styles.gallerySection}>
        <View style={styles.gallerySectionHeader}>
          <Text style={styles.sectionTitle}>
            Photos {photos.length > 0 ? `(${photos.length})` : ""}
          </Text>
        </View>

        <PhotoGallery
          photos={photos}
          isLoading={photosLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onSave={savePhoto}
          onUnsave={unsavePhoto}
          onDelete={deletePhoto}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: { fontSize: 15, color: "#6b7280", marginBottom: 12 },
  backLink: { fontSize: 14, color: "#7c3aed", fontWeight: "600" },

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
  backBtnText: { fontSize: 20, color: "#fff" },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "600", color: "#fff" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  eventTitle: { fontSize: 18, fontWeight: "700", color: "#111827", flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeActive: { backgroundColor: "#f0fdf4" },
  badgeExpired: { backgroundColor: "#f3f4f6" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  badgeTextActive: { color: "#16a34a" },
  badgeTextExpired: { color: "#6b7280" },
  eventDate: { fontSize: 13, color: "#6b7280", marginTop: 6 },
  eventDesc: { fontSize: 14, color: "#374151", marginTop: 10, lineHeight: 20 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 12 },
  metaText: { fontSize: 12, color: "#9ca3af" },
  metaDot: { fontSize: 12, color: "#d1d5db" },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },

  qrWrapper: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 12,
  },
  shareBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  shareBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  expiredNotice: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  expiredText: { fontSize: 13, color: "#92400e", lineHeight: 18 },

  gallerySection: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  gallerySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
});
