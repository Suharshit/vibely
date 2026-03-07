// ============================================================
// apps/mobile/App.tsx
// ============================================================
// Provider ORDER matters — outer providers are available to
// inner ones. NavigationContainer must be the outer wrapper
// because React Navigation context must exist for any navigation
// calls (including from AuthContext). AuthProvider goes inside
// NavigationContainer so auth state is available to all screens.
// ============================================================

import "react-native-url-polyfill/auto";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import RootNavigator from "./navigation";

export default function App() {
  return (
    // SafeAreaProvider ensures content stays within screen boundaries
    // (avoids notches, home indicator bars on newer iPhones)
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        {/*
          AuthProvider wraps RootNavigator so that useAuth() works
          inside all screens. The provider sets up the session listener
          and Supabase client — must initialize before any screen renders.
        */}
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
