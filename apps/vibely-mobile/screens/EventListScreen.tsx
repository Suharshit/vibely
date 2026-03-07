// ============================================================
// apps/mobile/screens/EventListScreen.tsx
// ============================================================
// Main screen after login: shows all of the user's events.
// Pull-to-refresh reloads events. FAB (floating action button)
// navigates to CreateEventScreen.
//
// WHY FlatList instead of ScrollView + map?
// FlatList only renders items currently visible on screen
// (virtualized). With 50+ events, ScrollView renders them all
// at once which causes jank. FlatList is the React Native
// equivalent of a virtual scroll.
// ============================================================

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/context/AuthContext";
import { relativeTime, isEventExpired } from "@shared/utils";
import type { AppStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function EventListScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();
  const { events, isLoading, error, refetch, deleteEvent } = useEvents();

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete event?",
      `"${title}" and all its photos will be permanently deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteEvent(id);
            if (!result.success) {
              Alert.alert("Error", result.error ?? "Failed to delete event");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item: event }: { item: (typeof events)[number] }) => {
    const expired = isEventExpired(event.expires_at);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("EventDetail", { eventId: event.id })
        }
        activeOpacity={0.7}
      >
        {/* Color strip based on status */}
        <View
          style={[
            styles.cardAccent,
            expired ? styles.cardAccentExpired : styles.cardAccentActive,
          ]}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {event.title}
            </Text>
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

          <Text style={styles.cardDate}>{relativeTime(event.event_date)}</Text>

          {event.description ? (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {event.description}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            <Text style={styles.cardRole}>
              {event.user_role === "host" ? "👑 Host" : "👤 Member"}
            </Text>

            {event.user_role === "host" && (
              <TouchableOpacity
                onPress={() => handleDelete(event.id, event.title)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Events</Text>
          <Text style={styles.headerSubtitle}>
            {user?.user_metadata?.full_name ?? user?.email}
          </Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          events.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#7c3aed"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyTitle}>No events yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first event and start collecting photos.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Floating action button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("EventCreate")}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  headerSubtitle: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  signOutText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },

  errorBanner: {
    backgroundColor: "#fef2f2",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
  },
  errorText: { color: "#dc2626", fontSize: 13 },

  listContent: { padding: 16, gap: 12 },
  listContentEmpty: { flex: 1 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardAccent: { width: 4 },
  cardAccentActive: { backgroundColor: "#7c3aed" },
  cardAccentExpired: { backgroundColor: "#d1d5db" },
  cardContent: { flex: 1, padding: 14 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111827", flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeActive: { backgroundColor: "#f0fdf4" },
  badgeExpired: { backgroundColor: "#f3f4f6" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  badgeTextActive: { color: "#16a34a" },
  badgeTextExpired: { color: "#6b7280" },
  cardDate: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  cardDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 6,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  cardRole: { fontSize: 12, color: "#6b7280" },
  deleteText: { fontSize: 12, color: "#ef4444", fontWeight: "500" },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  emptySubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 6,
    textAlign: "center",
    maxWidth: 260,
  },

  fab: {
    position: "absolute",
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: "#fff", lineHeight: 30 },
});
