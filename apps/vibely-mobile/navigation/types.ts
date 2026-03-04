// ============================================================
// apps/mobile/navigation/types.ts
// ============================================================
// WHY typed navigation params?
// React Navigation supports full TypeScript typing for routes
// and their params. With these types:
//   • navigation.navigate('Login') autocompletes
//   • navigation.navigate('EventDetail') without the required
//     eventId param causes a TypeScript error at compile time
//   • route.params.eventId is fully typed — no casting needed
//
// The pattern: each navigator gets its own ParamList type.
// Screens with no params use 'undefined'. Screens with params
// define them as an object.
// ============================================================

export type AuthStackParamList = {
  Login: undefined; // No params needed
  Signup: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  EventDetail: { eventId: string }; // Phase 8
  EventCreate: undefined; // Phase 8
  GuestUpload: { token: string }; // Phase 10
  Vault: undefined; // Phase 11
  Profile: undefined;
};

// Combined type for navigation prop typing within screens
// Usage in a screen:
//   const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Login'>>();
export type RootStackParamList = AuthStackParamList & AppStackParamList;
