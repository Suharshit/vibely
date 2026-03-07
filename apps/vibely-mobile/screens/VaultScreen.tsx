// ============================================================
// apps/mobile/screens/VaultScreen.tsx
// ============================================================

import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "@/lib/supabase/client";
import type { AppStackParamList } from "@/navigation/types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const COLUMNS = 3;
const GAP = 2;
const CELL = (Dimensions.get("window").width - GAP * (COLUMNS + 1)) / COLUMNS;
type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function VaultScreen() {
  const navigation = useNavigation<Nav>();
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVault = useCallback(async () => {
    setIsLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch(`${API_BASE}/api/vault`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setPhotos(data.photos ?? []);
    setIsLoading(false);
  }, []);

  // Re-fetch when screen comes into focus (handles unsave from detail page)
  useFocusEffect(
    useCallback(() => {
      fetchVault();
    }, [fetchVault])
  );

  const handleUnsave = async (photoId: string) => {
    Alert.alert("Remove from vault?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) return;
          await fetch(`${API_BASE}/api/photos/${photoId}/save`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          setPhotos((prev) => prev.filter((e) => e.photo.id !== photoId));
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={s.centered}>
        <Text style={s.emptyEmoji}>🔖</Text>
        <Text style={s.emptyTitle}>Vault is empty</Text>
        <Text style={s.emptySub}>Save photos from events to see them here</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      keyExtractor={(item) => item.vault_entry_id}
      numColumns={COLUMNS}
      style={s.list}
      columnWrapperStyle={s.row}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={s.cell}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("PhotoDetail", { photoId: item.photo.id })
          }
          onLongPress={() => handleUnsave(item.photo.id)}
        >
          <Image
            source={{ uri: item.photo.thumbnail_url }}
            style={s.img}
            resizeMode="cover"
          />
          {/* Event label */}
          {item.photo.event && (
            <View style={s.eventLabel}>
              <Text style={s.eventLabelText} numberOfLines={1}>
                {item.photo.event.title}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  );
}

const s = StyleSheet.create({
  list: { flex: 1, backgroundColor: "#f9fafb", padding: GAP },
  row: { gap: GAP, marginBottom: GAP },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  img: { width: "100%", height: "100%" },
  eventLabel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    padding: 3,
  },
  eventLabelText: { fontSize: 9, color: "#fff" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  emptySub: { fontSize: 13, color: "#9ca3af", textAlign: "center" },
});
