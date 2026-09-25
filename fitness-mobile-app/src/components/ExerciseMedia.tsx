import React from 'react';
import { View, Image, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface ExerciseMediaProps {
  /** mp4 — used when present (paid tier) */
  videoUrl?: string;
  /** animated demo GIF (free OSS tier) */
  gifUrl?: string;
  imageUrl?: string;
  style?: ViewStyle;
  /** show play-chip overlay (best for detail view) */
  showPlayBadge?: boolean;
  onPress?: () => void;
}

const VideoDemo = ({ source, style }: { source: string; style?: ViewStyle }) => {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={style} contentFit="cover" nativeControls={false} />;
};

/**
 * Renders a real exercise demonstration:
 *  - mp4 via expo-video when the API provides one (paid tier)
 *  - otherwise the animated GIF from the free OSS tier
 */
export const ExerciseMedia = ({
  videoUrl,
  gifUrl,
  imageUrl,
  style,
  showPlayBadge = false,
  onPress,
}: ExerciseMediaProps) => {
  const source = videoUrl || gifUrl || imageUrl || '';

  const content = videoUrl ? (
    <VideoDemo source={videoUrl} style={StyleSheet.absoluteFill} />
  ) : (
    <Image source={{ uri: source }} style={StyleSheet.absoluteFill} resizeMode="cover" />
  );

  const inner = (
    <>
      {content}
      {showPlayBadge && (
        <View style={styles.playBadge} pointerEvents="none">
          <Ionicons name="play" size={22} color={colors.background} />
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable style={[styles.container, style]} onPress={onPress}>
        {inner}
      </Pressable>
    );
  }

  return <View style={[styles.container, style]}>{inner}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  playBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6,8,13,0.72)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
});