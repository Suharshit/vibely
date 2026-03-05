// ============================================================
// apps/mobile/components/photos/UploadProgressList.tsx
// ============================================================
// Shows a compact list of in-progress and recently completed
// uploads. Renders above the photo gallery in EventDetailScreen.
// ============================================================

import { View, Text, StyleSheet } from 'react-native';
import type { MobileUploadItem } from '@/hooks/usePhotos';

interface UploadProgressListProps {
  uploads: MobileUploadItem[];
}

export function UploadProgressList({ uploads }: UploadProgressListProps) {
  // Only show uploads that aren't fully complete and dismissed
  const visible = uploads.filter(u => u.status !== 'done');
  if (visible.length === 0) return null;

  return (
    <View style={styles.container}>
      {visible.map((upload, i) => (
        <UploadRow key={i} upload={upload} />
      ))}
    </View>
  );
}

function UploadRow({ upload }: { upload: MobileUploadItem }) {
  const isError = upload.status === 'error';
  const isCompleting = upload.status === 'completing';

  return (
    <View style={[styles.row, isError && styles.rowError]}>
      <View style={styles.info}>
        <Text style={styles.filename} numberOfLines={1}>{upload.filename}</Text>

        {isError ? (
          <Text style={styles.errorText}>{upload.error}</Text>
        ) : (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${upload.progress}%` }]} />
          </View>
        )}
      </View>

      <Text style={[styles.statusText, isError && styles.statusTextError]}>
        {isError ? '✗' : isCompleting ? '…' : `${upload.progress}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  rowError: { borderColor: '#fee2e2', backgroundColor: '#fef2f2' },
  info: { flex: 1 },
  filename: { fontSize: 12, fontWeight: '500', color: '#374151', marginBottom: 5 },
  progressTrack: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  errorText: { fontSize: 11, color: '#ef4444' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#7c3aed', minWidth: 32, textAlign: 'right' },
  statusTextError: { color: '#ef4444' },
});