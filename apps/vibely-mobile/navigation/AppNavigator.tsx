import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

// Import screens (we'll create these next)
import HomeScreen from "../screens/HomeScreen";
import EventDetailsScreen from "../screens/EventDetailsScreen";
import CreateEventScreen from "../screens/CreateEventScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0ea5e9", // brand-500
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Events Image Manager" }}
        />
        <Stack.Screen
          name="EventDetails"
          component={EventDetailsScreen}
          options={{ title: "Event Details" }}
        />
        <Stack.Screen
          name="CreateEvent"
          component={CreateEventScreen}
          options={{ title: "Create Event" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}