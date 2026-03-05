// ============================================================
// apps/mobile/navigation/index.tsx  (updated for Phase 8)
// ============================================================

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";
import type { AuthStackParamList, AppStackParamList } from "./types";

// Auth screens
import LoginScreen from "@/screens/LoginScreen";
import SignupScreen from "@/screens/SignupScreen";

// App screens
import EventListScreen from "@/screens/EventListScreen";
import EventDetailScreen from "@/screens/EventDetailScreen";
import CreateEventScreen from "@/screens/CreateEventScreen";
import JoinEventScreen from "@/screens/JoinEventScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      {/* Dashboard — the home screen after login */}
      <AppStack.Screen name="Dashboard" component={EventListScreen} />

      {/* Event screens */}
      <AppStack.Screen name="EventDetail" component={EventDetailScreen} />
      <AppStack.Screen name="EventCreate" component={CreateEventScreen} />
      <AppStack.Screen name="JoinEvent" component={JoinEventScreen} />

      {/* Phase 10+ screens will be added here */}
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}
