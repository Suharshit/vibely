/* eslint-disable @typescript-eslint/no-unused-vars */
// ============================================================
// apps/mobile/screens/EventDetailScreen.tsx
// ============================================================

import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share, Alert, ActivityIndicator, Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useState, useEffect, useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { supabase } from '@/lib/supabase/client';
import { formatEventDate, relativeTime, isEventExpired } from '@shared/utils/invite';
import type { AppStackParamList } from '@/navigation/types';

type EventDetailRoute = RouteProp<AppStackParamList, 'EventDetail'>;
type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function EventDetailScreen() {
  const route = useRoute<EventDetailRoute>();
  const navigation = useNavigation<Nav>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch event with host and members
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          id, title, description, cover_image_url,
          host_id, invite_token, event_date, expires_at,
          status, upload_permission, created_at,
          host:users!host_id ( id, name, avatar_url ),
          event_members (
            id, role, joined_at, is_guest,
            user:users ( id, name, avatar_url )
          )
        `)
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Get this user's role
      const member = eventData?.event_members?.find((m: any) => m.user?.id === user.id);
      setUserRole(member?.role ?? '');
      setEvent(eventData);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const inviteUrl = event
    ? `https://vibely.app/join/${event.invite_token}` // replace with your domain
    : '';

  const handleShare = async () => {
    try {
      await Share.share({
        title: event?.title,
        message: `Join "${event?.title}" on Vibely and share your photos!\n\n${inviteUrl}`,
        url: inviteUrl,
      });
    } catch {
      // User cancelled share sheet — not an error
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Event not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const expired = isEventExpired(event.expires_at);
  const isHost = userRole === 'host';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header banner */}
      <View style={styles.banner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bannerBack}>
          <Text style={styles.bannerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.bannerTitle} numberOfLines={1}>{event.title}</Text>
      </View>

      <View style={styles.content}>
        {/* Event meta */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={[styles.badge, expired ? styles.badgeExpired : styles.badgeActive]}>
              <Text style={[styles.badgeText, expired ? styles.badgeTextExpired : styles.badgeTextActive]}>
                {expired ? 'Ended' : 'Active'}
              </Text>
            </View>
          </View>

          <Text style={styles.eventDate}>{formatEventDate(event.event_date)}</Text>

          {event.description ? (
            <Text style={styles.eventDescription}>{event.description}</Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>By {event.host?.name}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{event.event_members?.length ?? 0} members</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>Expires {relativeTime(event.expires_at)}</Text>
          </View>
        </View>

        {/* Invite section — only for active events */}
        {!expired && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Invite guests</Text>

            {/* QR Code */}
            <View style={styles.qrWrapper}>
              <QRCode
                value={inviteUrl}
                size={180}
                color="#111827"
                backgroundColor="#ffffff"
              />
            </View>

            {/* Invite link */}
            <View style={styles.linkRow}>
              <Text style={styles.linkText} numberOfLines={1}>{inviteUrl}</Text>
            </View>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
              <Text style={styles.shareBtnText}>Share invite link</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Members */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Members ({event.event_members?.length ?? 0})</Text>
          <View style={styles.memberList}>
            {event.event_members?.map((m: any) => (
              <View key={m.id} style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {(m.user?.name ?? '?')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {m.user?.name ?? 'Unknown'}{m.is_guest ? ' (guest)' : ''}
                  </Text>
                  <Text style={styles.memberRole}>{m.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#6b7280', fontSize: 15, marginBottom: 12 },
  backBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#7c3aed', borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '600' },

  banner: {
    backgroundColor: '#7c3aed',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerBack: { padding: 4 },
  bannerBackText: { fontSize: 20, color: '#fff' },
  bannerTitle: { fontSize: 18, fontWeight: '600', color: '#fff', flex: 1 },

  content: { padding: 16, gap: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  eventTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeActive: { backgroundColor: '#f0fdf4' },
  badgeExpired: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextActive: { color: '#16a34a' },
  badgeTextExpired: { color: '#6b7280' },

  eventDate: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  eventDescription: { fontSize: 14, color: '#374151', marginTop: 10, lineHeight: 20 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 12 },
  metaText: { fontSize: 12, color: '#9ca3af' },
  metaDot: { fontSize: 12, color: '#d1d5db' },

  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 14 },

  qrWrapper: { alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },

  linkRow: { backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, marginBottom: 12 },
  linkText: { fontSize: 12, color: '#6b7280', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  shareBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  memberList: { gap: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ede9fe', justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { fontSize: 14, fontWeight: '600', color: '#7c3aed' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  memberRole: { fontSize: 12, color: '#9ca3af', textTransform: 'capitalize' },
});