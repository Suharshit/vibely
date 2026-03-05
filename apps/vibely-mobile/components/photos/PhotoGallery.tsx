// ============================================================
// apps/mobile/components/photos/PhotoGallery.tsx
// ============================================================
// FlatList-based photo grid with:
//   - Infinite scroll (load more on end reached)
//   - Long-press for save/delete action sheet
//   - Tap to open full-screen preview modal
//   - Skeleton loading state
// ============================================================

import {
  View, FlatList, Image, TouchableOpacity,
  StyleSheet, Dimensions, Modal, ActionSheetIOS,
  Alert, Platform, ActivityIndicator, Text,
} from 'react-native';
import { useState } from 'react';
import type { GalleryPhoto } from '@/hooks/usePhotos';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMNS = 3;
const GAP = 2;
const CELL_SIZE = (SCREEN_WIDTH - GAP * (COLUMNS + 1)) / COLUMNS;

// ── Photo Cell ─────────────────────────────────────────────

interface PhotoCellProps {
  photo: GalleryPhoto;
  onPress: (photo: GalleryPhoto) => void;
  onLongPress: (photo: GalleryPhoto) => void;
}

function PhotoCell({ photo, onPress, onLongPress }: PhotoCellProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(photo)}
      onLongPress={() => onLongPress(photo)}
      activeOpacity={0.85}
      style={styles.cell}
    >
      <Image
        source={{ uri: photo.thumbnail_url }}
        style={styles.cellImage}
        resizeMode="cover"
      />
      {/* Saved indicator */}
      {photo.saved_by_me && (
        <View style={styles.savedBadge}>
          <Text style={styles.savedBadgeText}>🔖</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Skeleton loader ──────────────────────────────────────────

function SkeletonGrid() {
  return (
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={[styles.cell, styles.skeletonCell]} />
      ))}
    </View>
  );
}

// ── Full-screen preview modal ────────────────────────────────

interface PreviewModalProps {
  photo: GalleryPhoto | null;
  onClose: () => void;
  onSave: (id: string) => void;
  onUnsave: (id: string) => void;
}

function PreviewModal({ photo, onClose, onSave, onUnsave }: PreviewModalProps) {
  if (!photo) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Close / Save controls */}
        <View style={styles.modalControls}>
          <TouchableOpacity onPress={onClose} style={styles.modalBtn}>
            <Text style={styles.modalBtnText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => photo.saved_by_me ? onUnsave(photo.id) : onSave(photo.id)}
            style={[styles.modalBtn, photo.saved_by_me && styles.modalBtnSaved]}
          >
            <Text style={styles.modalBtnText}>🔖</Text>
          </TouchableOpacity>
        </View>

        {/* Image */}
        <Image
          source={{ uri: photo.preview_url }}
          style={styles.previewImage}
          resizeMode="contain"
        />

        {/* Meta */}
        <View style={styles.modalMeta}>
          {photo.uploader && (
            <Text style={styles.modalMetaText}>by {photo.uploader.name}</Text>
          )}
          <Text style={styles.modalMetaSubtext}>{photo.original_filename}</Text>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Gallery ──────────────────────────────────────────────

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSave: (id: string) => void;
  onUnsave: (id: string) => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function PhotoGallery({
  photos, isLoading, hasMore,
  onLoadMore, onSave, onUnsave, onDelete,
}: PhotoGalleryProps) {
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  const handleLongPress = (photo: GalleryPhoto) => {
    const options = [
      photo.saved_by_me ? 'Remove from Vault' : 'Save to Vault',
      ...(photo.is_mine ? ['Delete Photo'] : []),
      'Cancel',
    ];
    const cancelIndex = options.length - 1;
    const destructiveIndex = photo.is_mine ? 1 : -1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex, destructiveButtonIndex: destructiveIndex },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            photo.saved_by_me ? onUnsave(photo.id) : onSave(photo.id);
          } else if (photo.is_mine && buttonIndex === 1) {
            confirmDelete(photo);
          }
        }
      );
    } else {
      // Android: use Alert with buttons
      Alert.alert(photo.original_filename, 'Choose an action', [
        {
          text: photo.saved_by_me ? 'Remove from Vault' : 'Save to Vault',
          onPress: () => photo.saved_by_me ? onUnsave(photo.id) : onSave(photo.id),
        },
        ...(photo.is_mine ? [{
          text: 'Delete Photo',
          style: 'destructive' as const,
          onPress: () => confirmDelete(photo),
        }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    }
  };

  const confirmDelete = (photo: GalleryPhoto) => {
    Alert.alert('Delete photo?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await onDelete(photo.id);
          if (!result.success) {
            Alert.alert('Error', result.error ?? 'Failed to delete');
          }
        },
      },
    ]);
  };

  if (isLoading && photos.length === 0) {
    return <SkeletonGrid />;
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📷</Text>
        <Text style={styles.emptyTitle}>No photos yet</Text>
        <Text style={styles.emptySubtitle}>Be the first to upload!</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={photos}
        keyExtractor={item => item.id}
        numColumns={COLUMNS}
        scrollEnabled={false}        // Parent ScrollView handles scrolling
        renderItem={({ item }) => (
          <PhotoCell
            photo={item}
            onPress={setPreviewPhoto}
            onLongPress={handleLongPress}
          />
        )}
        columnWrapperStyle={styles.row}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          hasMore ? (
            <View style={styles.loadMoreIndicator}>
              <ActivityIndicator size="small" color="#7c3aed" />
            </View>
          ) : null
        }
      />

      <PreviewModal
        photo={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
        onSave={onSave}
        onUnsave={onUnsave}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { gap: GAP, marginBottom: GAP },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  cellImage: { width: '100%', height: '100%' },
  savedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
  },
  savedBadgeText: { fontSize: 10 },

  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, padding: GAP },
  skeletonCell: { opacity: 0.4, backgroundColor: '#e5e7eb' },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  emptySubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 4 },

  loadMoreIndicator: { padding: 16, alignItems: 'center' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
  },
  modalControls: {
    position: 'absolute',
    top: 52,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  modalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnSaved: { backgroundColor: 'rgba(245,158,11,0.7)' },
  modalBtnText: { fontSize: 14, color: '#fff' },
  previewImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  modalMeta: { padding: 16, paddingTop: 12 },
  modalMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  modalMetaSubtext: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
});