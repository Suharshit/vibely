// ============================================================
// apps/mobile/navigation/types.ts  (updated Phase 10)
// ============================================================

export type AppStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;

  // Main tabs
  Dashboard: undefined;
  Vault: undefined;
  Profile: undefined;

  // Event stack
  EventDetail: { eventId: string };
  EventCreate: undefined;
  EditEvent: { eventId: string };
  JoinEvent: { token?: string } | undefined;

  // Photo
  PhotoDetail: { photoId: string };

  // Guest
  GuestUpload: { inviteToken: string };
};
