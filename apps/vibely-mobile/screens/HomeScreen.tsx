import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { API_ROUTES } from "@repo/shared/constants";
import { formatFileSize } from "@repo/shared/utils";
import { APP_CONFIG } from "@repo/shared/constants";

export default function HomeScreen({ navigation }: any) {
  const maxFileSize = formatFileSize(APP_CONFIG.PHOTO.MAX_FILE_SIZE);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 space-y-6">
        {/* Hero Section */}
        <View className="items-center justify-items-center py-8">
          <Text className="text-4xl font-bold text-gray-900 text-center">
            Vibely
          </Text>
          <Text className="text-lg text-gray-600 text-center mt-4">
            Share event photos effortlessly
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          <TouchableOpacity
            className="bg-brand-500 py-4 px-6 rounded-lg"
            onPress={() => navigation.navigate("CreateEvent")}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Create Event
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="border-2 border-brand-500 py-4 px-6 rounded-lg">
            <Text className="text-brand-500 text-center font-semibold text-lg">
              Join Event with QR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
          <Text className="text-sm text-gray-500 text-center">
            ✅ Phase 4: Shared package integration complete
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-2">
            Using shared constants: Max file size is {maxFileSize}
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-1">
            API Base: {API_ROUTES.EVENTS.BASE}
          </Text>
        </View>

        {/* Recent Events Placeholder */}
        <View className="mt-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Recent Events
          </Text>
          <View className="bg-white p-6 rounded-lg border border-gray-200">
            <Text className="text-gray-500 text-center">
              No events yet. Create your first event!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}