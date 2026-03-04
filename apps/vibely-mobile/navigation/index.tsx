// ============================================================
// apps/mobile/navigation/index.tsx
// ============================================================
// WHY split into two stacks (Auth and App)?
// React Navigation best practice for authenticated apps is to
// have completely separate navigator trees for logged-out and
// logged-in states. When auth state changes:
//   • isAuthenticated=false → render AuthStack (Login, Signup)
//   • isAuthenticated=true  → render AppStack (Dashboard, Events, etc.)
//
// This approach is safer than conditionally showing/hiding screens
// within a single stack because:
// 1. Users can NEVER navigate to protected screens while logged out
//    (even with a back gesture or deep link bypass)
// 2. Logged-in users can NEVER access Login/Signup screens
// 3. The navigation history resets cleanly on auth state change —
//    no stale screens in the back stack
//
// NavigationContainer is the root — it holds navigation state and
// must wrap everything. It goes in App.tsx, not here.
// ============================================================

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";
import type {
  RootStackParamList,
  AuthStackParamList,
  AppStackParamList,
} from "./types";

// Auth Screens
import LoginScreen from "@/screens/LoginScreen";
import SignupScreen from "@/screens/SignupScreen";

// App Screens (placeholders — we'll build these in Phase 8+)
import DashboardScreen from "@/screens/DashboardScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// ── Auth Navigator (unauthenticated users) ────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        // Use a subtle horizontal slide — standard for auth flows
        animation: "slide_from_right",
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

// ── App Navigator (authenticated users) ──────────────────────
function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <AppStack.Screen name="Dashboard" component={DashboardScreen} />
      {/* Phase 8+ screens go here */}
    </AppStack.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────
// This is the component that switches between Auth and App trees.
// It renders during the initial load check too.
export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // While we're checking the stored session (AsyncStorage read),
  // show a loading spinner. This prevents a flash of the login
  // screen on startup for users who are already logged in.
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
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}
