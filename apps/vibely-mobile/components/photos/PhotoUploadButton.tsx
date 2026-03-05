// ============================================================
// apps/mobile/components/photos/PhotoUploadButton.tsx
// ============================================================
// Tappable upload button that:
//   1. Requests camera roll permission
//   2. Opens the native image picker (expo-image-picker)
//   3. Compresses the image (expo-image-manipulator)
//   4. Calls the upload function from usePhotos
//
// WHY compress before upload?
// iPhone 15 Pro photos are 12-48MB. Even with our 10MB limit,
// compressing to ~2MB before upload:
//   - Makes uploads 5x faster on slow event WiFi
//   - Reduces Supabase Storage costs
//   - ImageKit still delivers the right size to each client
//
// WHY request permissions explicitly before picking?
// iOS requires showing a permission rationale before the system
// dialog. Calling launchImageLibraryAsync() without checking
// permissions first can silently fail on iOS 14+.
// ============================================================

import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useState } from "react";

interface PhotoUploadButtonProps {
  eventId: string;
  onUpload: (
    uri: string,
    filename: string,
    contentType: string,
    fileSize: number,
    guestToken?: string
  ) => Promise<void>;
  guestToken?: string;
  disabled?: boolean;
}

// Compression settings:
//   compress: 0.8 = 80% JPEG quality (good balance of size vs quality)
//   resize width: 2400px max — enough for full-screen display on any device
//   format: JPEG — smaller than PNG for photos, universally supported
const COMPRESS_OPTIONS: ImageManipulator.Action[] = [
  { resize: { width: 2400 } },
];
const COMPRESS_QUALITY = 0.82;

export function PhotoUploadButton({
  eventId,
  onUpload,
  guestToken,
  disabled = false,
}: PhotoUploadButtonProps) {
  const [isPicking, setIsPicking] = useState(false);

  const handlePress = async () => {
    if (disabled || isPicking) return;

    // Step 1: Check/request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow photo access in Settings to upload photos.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsPicking(true);

    try {
      // Step 2: Open native image picker
      // allowsMultipleSelection: true lets users pick several at once
      // mediaTypes: Images only (no videos)
      // exif: false — we don't need EXIF data, reduces payload
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10, // max 10 photos at once
        quality: 1, // full quality — we compress ourselves
        exif: false,
      });

      if (result.canceled || result.assets.length === 0) return;

      // Step 3: Compress and upload each selected image
      for (const asset of result.assets) {
        // Compress the image
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          COMPRESS_OPTIONS,
          {
            compress: COMPRESS_QUALITY,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        // Build a clean filename
        const originalName =
          asset.fileName ?? asset.uri.split("/").pop() ?? "photo";
        const baseName = originalName.replace(/\.[^/.]+$/, "");
        const filename = `${baseName}.jpg`;

        // Get file info for size (manipulateAsync doesn't return size directly)
        const fileInfo = await fetch(manipulated.uri)
          .then((r) => r.blob())
          .then((b) => ({ size: b.size }))
          .catch(() => ({ size: asset.fileSize ?? 0 }));

        // Step 4: Kick off the upload
        await onUpload(
          manipulated.uri,
          filename,
          "image/jpeg",
          fileInfo.size,
          guestToken
        );
      }
    } catch (err) {
      Alert.alert("Error", "Failed to process image. Please try again.");
      console.error("[PhotoUploadButton]", err);
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || isPicking}
      activeOpacity={0.8}
      style={[styles.button, (disabled || isPicking) && styles.buttonDisabled]}
    >
      {isPicking ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <View style={styles.inner}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.label}>Upload Photos</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Compact icon-only version for toolbars ────────────────────

export function PhotoUploadIcon({
  eventId,
  onUpload,
  guestToken,
  disabled,
}: PhotoUploadButtonProps) {
  const [isPicking, setIsPicking] = useState(false);

  const handlePress = async () => {
    if (disabled || isPicking) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    setIsPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 1,
        exif: false,
      });

      if (result.canceled) return;

      for (const asset of result.assets) {
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          COMPRESS_OPTIONS,
          {
            compress: COMPRESS_QUALITY,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        const filename =
          (asset.fileName ?? "photo").replace(/\.[^/.]+$/, "") + ".jpg";
        const blob = await fetch(manipulated.uri).then((r) => r.blob());
        await onUpload(
          manipulated.uri,
          filename,
          "image/jpeg",
          blob.size,
          guestToken
        );
      }
    } finally {
      setIsPicking(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || isPicking}
      style={styles.iconButton}
    >
      {isPicking ? (
        <ActivityIndicator size="small" color="#7c3aed" />
      ) : (
        <Text style={styles.iconButtonText}>＋</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  inner: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { fontSize: 18 },
  label: { fontSize: 15, fontWeight: "600", color: "#fff" },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonText: { fontSize: 22, color: "#fff", lineHeight: 24 },
});
