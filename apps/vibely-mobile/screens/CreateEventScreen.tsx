// ============================================================
// apps/mobile/screens/CreateEventScreen.tsx
// ============================================================
// WHY DateTimePicker?
// Mobile has no <input type="datetime-local">. We use
// @react-native-community/datetimepicker which renders the
// native OS date/time picker (the spinning wheel on iOS,
// calendar dialog on Android). This feels correct and native.
// ============================================================

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEvents } from "@/hooks/useEvents";
import type { AppStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function CreateEventScreen() {
  const navigation = useNavigation<Nav>();
  const { createEvent } = useEvents();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadPermission, setUploadPermission] = useState<
    "open" | "restricted"
  >("open");
  const [isLoading, setIsLoading] = useState(false);

  // Date picker state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const [eventDate, setEventDate] = useState<Date>(tomorrow);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      // Preserve the existing time when only the date changes
      const newDate = new Date(selected);
      newDate.setHours(eventDate.getHours(), eventDate.getMinutes());
      setEventDate(newDate);
      // On iOS, after picking date, show time picker
      if (Platform.OS === "ios") setShowTimePicker(true);
    }
  };

  const onTimeChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) setEventDate(selected);
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const handleCreate = async () => {
    if (title.trim().length < 2) {
      Alert.alert("Event name required", "Please enter at least 2 characters.");
      return;
    }
    if (eventDate <= new Date()) {
      Alert.alert("Invalid date", "Event date must be in the future.");
      return;
    }

    setIsLoading(true);
    const result = await createEvent({
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDate.toISOString(),
      upload_permission: uploadPermission,
    });
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.error ?? "Failed to create event");
      return;
    }

    // Navigate to the new event's detail screen
    if (result.event) {
      navigation.replace("EventDetail", { eventId: result.event.id });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Event</Text>
        </View>

        <View style={styles.form}>
          {/* Event Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Event name *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Sarah's Wedding"
              placeholderTextColor="#9ca3af"
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Tell guests what to expect…"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          {/* Date & Time */}
          <View style={styles.field}>
            <Text style={styles.label}>Date & Time *</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.input, styles.dateButton]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(eventDate)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.input, styles.timeButton]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatTime(eventDate)}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              Photos expire 30 days after this date.
            </Text>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={eventDate}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimeChange}
            />
          )}

          {/* Upload Permission */}
          <View style={styles.field}>
            <Text style={styles.label}>Who can upload photos?</Text>
            <View style={styles.permissionRow}>
              <TouchableOpacity
                style={[
                  styles.permissionOption,
                  uploadPermission === "open" && styles.permissionSelected,
                ]}
                onPress={() => setUploadPermission("open")}
              >
                <Text style={styles.permissionIcon}>🌐</Text>
                <Text style={styles.permissionTitle}>Anyone with link</Text>
                <Text style={styles.permissionSubtitle}>Guests can upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.permissionOption,
                  uploadPermission === "restricted" &&
                    styles.permissionSelected,
                ]}
                onPress={() => setUploadPermission("restricted")}
              >
                <Text style={styles.permissionIcon}>🔒</Text>
                <Text style={styles.permissionTitle}>Members only</Text>
                <Text style={styles.permissionSubtitle}>Account required</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleCreate}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitText}>Create Event</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { padding: 20, paddingBottom: 48 },

  header: { marginBottom: 24 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, color: "#7c3aed", fontWeight: "500" },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },

  form: { gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111827",
  },
  textArea: { minHeight: 80, textAlignVertical: "top", paddingTop: 13 },
  hint: { fontSize: 12, color: "#9ca3af" },

  dateRow: { flexDirection: "row", gap: 10 },
  dateButton: { flex: 3 },
  timeButton: { flex: 2 },
  dateButtonText: { fontSize: 14, color: "#374151" },

  permissionRow: { flexDirection: "row", gap: 10 },
  permissionOption: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    gap: 4,
  },
  permissionSelected: { borderColor: "#7c3aed", backgroundColor: "#faf5ff" },
  permissionIcon: { fontSize: 20 },
  permissionTitle: { fontSize: 13, fontWeight: "600", color: "#111827" },
  permissionSubtitle: { fontSize: 11, color: "#9ca3af" },

  submitBtn: {
    backgroundColor: "#7c3aed",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
