/**
 * Navigation type definitions
 * Defines all routes and their parameters
 */

export type RootStackParamList = {
  // Auth Stack
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;

  // Main Stack
  Home: undefined;
  EventDetails: { eventId: string };
  EventGallery: { eventId: string };
  PhotoUpload: { eventId: string };
  GuestSession: { eventId: string; inviteToken: string };
  Profile: undefined;
  Vault: undefined;

  // Event Creation
  CreateEvent: undefined;
  JoinEvent: undefined;
};

// Helper type for navigation prop
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: any; // We'll type this properly later
  route: { params: RootStackParamList[T] };
};