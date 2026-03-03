import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function CreateEventScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    // TODO: Implement event creation API call
    console.log("Creating event:", { title, description });

    // For now, just navigate to event details with mock ID
    navigation.navigate("EventDetails", { eventId: "mock-event-123" });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-6 space-y-6">
          {/* Form Header */}
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Create New Event
            </Text>
            <Text className="text-sm text-gray-600 mt-2">
              Set up your event and invite guests to share photos
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            {/* Title Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="e.g., Wedding Reception"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Description Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Brief description of your event"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Date Picker Placeholder */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </Text>
              <TouchableOpacity className="bg-white border border-gray-300 rounded-lg px-4 py-3">
                <Text className="text-gray-400">Select date & time</Text>
              </TouchableOpacity>
            </View>

            {/* Expiration Placeholder */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Photos Expire After
              </Text>
              <TouchableOpacity className="bg-white border border-gray-300 rounded-lg px-4 py-3">
                <Text className="text-gray-400">7 days after event</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            className={`py-4 px-6 rounded-lg ${
              title ? "bg-brand-500" : "bg-gray-300"
            }`}
            onPress={handleCreate}
            disabled={!title}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Create Event
            </Text>
          </TouchableOpacity>

          {/* Info Card */}
          <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Text className="text-sm text-blue-800">
              💡 After creating the event, you'll receive an invite link and QR
              code to share with guests.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
