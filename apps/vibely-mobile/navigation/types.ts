// ============================================================
// apps/mobile/navigation/types.ts  (updated for Phase 8)
// ============================================================

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  EventDetail: { eventId: string };
  EventCreate: undefined;
  JoinEvent: { token?: string }; // token is optional — user can type it
  GuestUpload: { token: string }; // Phase 10
  Vault: undefined; // Phase 11
  Profile: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
