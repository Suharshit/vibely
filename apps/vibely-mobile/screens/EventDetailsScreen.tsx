import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function EventDetailsScreen({ route, navigation }: any) {
  const { eventId } = route.params || {};

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6 space-y-6">
        {/* Event Header */}
        <View className="bg-white p-6 rounded-lg shadow-sm">
          <Text className="text-2xl font-bold text-gray-900">
            Event Details
          </Text>
          <Text className="text-sm text-gray-500 mt-2">
            Event ID: {eventId || "Not specified"}
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="space-y-3">
          <TouchableOpacity className="bg-brand-500 py-3 px-4 rounded-lg">
            <Text className="text-white text-center font-semibold">
              Upload Photos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="border border-brand-500 py-3 px-4 rounded-lg">
            <Text className="text-brand-500 text-center font-semibold">
              View Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="border border-gray-300 py-3 px-4 rounded-lg">
            <Text className="text-gray-700 text-center font-semibold">
              Share Invite Link
            </Text>
          </TouchableOpacity>
        </View>

        {/* Event Info Placeholder */}
        <View className="bg-white p-6 rounded-lg border border-gray-200">
          <Text className="text-base text-gray-700 mb-2">
            📅 Event Date: TBD
          </Text>
          <Text className="text-base text-gray-700 mb-2">
            📸 Photos: 0
          </Text>
          <Text className="text-base text-gray-700">
            👥 Members: 1 (host)
          </Text>
        </View>

        {/* Implementation Note */}
        <View className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <Text className="text-sm text-yellow-800">
            🚧 This screen will fetch event data from API in Phase 6
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}