// ============================================================
// apps/mobile/navigation/index.tsx  (updated Phase 10)
// ============================================================
// Navigation structure:
//
// RootStack (NativeStack, no header)
//   ├── Auth screens (Login, Register) — shown when logged out
//   └── MainTabs (BottomTab) — shown when logged in
//       ├── DashboardStack (NativeStack)
//       │   ├── EventList (tab root)
//       │   ├── EventDetail
//       │   ├── EventCreate
//       │   ├── EditEvent
//       │   ├── JoinEvent
//       │   ├── PhotoDetail
//       │   └── GuestUpload
//       ├── VaultStack (NativeStack)
//       │   └── Vault (tab root)
//       └── ProfileStack (NativeStack)
//           └── Profile (tab root)
// ============================================================

// import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

// Auth screens
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/SignupScreen";

// Event screens
import EventListScreen from "@/screens/EventListScreen";
import EventDetailScreen from "@/screens/EventDetailScreen";
import CreateEventScreen from "@/screens/CreateEventScreen";
// EditEventScreen is below — inline for brevity in this phase
import JoinEventScreen from "@/screens/JoinEventScreen";
import GuestUploadScreen from "@/screens/GuestUploadScreen";

// Photo & vault screens (split into own files in production)
// We import from the combined file here for Phase 10
import VaultScreen from "@/screens/VaultScreen";
import { PhotoDetailScreen } from "@/screens/PhotoDetailScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import EditEventScreen from "@/screens/EditEventScreen";

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const DashStack = createNativeStackNavigator();
const VaultStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ── Tab icon helper ───────────────────────────────────────────

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ opacity: focused ? 1 : 0.5 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

// ── Dashboard stack ───────────────────────────────────────────

function DashboardStackNavigator() {
  return (
    <DashStack.Navigator screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="EventList" component={EventListScreen} />
      <DashStack.Screen name="EventDetail" component={EventDetailScreen} />
      <DashStack.Screen name="EventCreate" component={CreateEventScreen} />
      <DashStack.Screen name="EditEvent" component={EditEventScreen} />
      <DashStack.Screen name="JoinEvent" component={JoinEventScreen} />
      <DashStack.Screen name="PhotoDetail" component={PhotoDetailScreen} />
      <DashStack.Screen name="GuestUpload" component={GuestUploadScreen} />
    </DashStack.Navigator>
  );
}

// ── Vault stack ───────────────────────────────────────────────

function VaultStackNavigator() {
  return (
    <VaultStack.Navigator screenOptions={{ headerShown: false }}>
      <VaultStack.Screen name="VaultMain" component={VaultScreen} />
      <VaultStack.Screen name="PhotoDetail" component={PhotoDetailScreen} />
    </VaultStack.Navigator>
  );
}

// ── Profile stack ─────────────────────────────────────────────

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// ── Main tabs ─────────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: "#7c3aed",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: "Events",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Vault"
        component={VaultStackNavigator}
        options={{
          tabBarLabel: "Vault",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔖" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ── Root navigator ────────────────────────────────────────────

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // Splash screen handles this

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
}
