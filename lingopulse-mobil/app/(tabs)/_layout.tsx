import { Redirect, Tabs, usePathname } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { HapticTab } from '@/components/haptic-tab';
import { useAppColors } from '@/src/context/ThemeContext';
import { useNowPlaying } from '@/src/context/NowPlayingContext';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  const { nowPlaying, controls } = useNowPlaying();
  const pathname = usePathname();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  const TAB_BAR_HEIGHT = 56 + insets.bottom;
  const showMiniPlayer = !!nowPlaying.currentWord && pathname !== '/podcast';

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: c.textMuted,
          tabBarStyle: {
            backgroundColor: c.surface,
            borderTopColor: c.border,
            borderTopWidth: 1,
            height: TAB_BAR_HEIGHT,
            paddingBottom: insets.bottom + 6,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen name="index"   options={{ title: 'Ana Sayfa',  tabBarIcon: ({ color, size }) => <Ionicons name="home"    size={size} color={color} /> }} />
        <Tabs.Screen name="lists"   options={{ title: 'Listelerim', tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} /> }} />
        <Tabs.Screen name="podcast" options={{ title: 'Dinle',      tabBarIcon: ({ color, size }) => <Ionicons name="headset" size={size} color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profilim',   tabBarIcon: ({ color, size }) => <Ionicons name="person"  size={size} color={color} /> }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>

      {showMiniPlayer && (
        <View style={[styles.miniPlayer, { bottom: TAB_BAR_HEIGHT, backgroundColor: c.surface }]}>

          {/* İnce ilerleme çubuğu */}
          <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
            <View style={[styles.progressFill, { backgroundColor: c.primary, width: `${Math.round(nowPlaying.progress * 100)}%` as any }]} />
          </View>

          {/* Liste adı — ince çizginin altında küçük metin */}
          <View style={styles.listNameRow}>
            <View style={[styles.listNameLine, { backgroundColor: c.border }]} />
            <Text style={[styles.listNameText, { color: c.textMuted }]} numberOfLines={1}>
              {nowPlaying.currentListName}
            </Text>
            <View style={[styles.listNameLine, { backgroundColor: c.border }]} />
          </View>

          {/* Ana satır */}
          <View style={styles.mainRow}>

            {/* Sol: 🎧 emoji + İngilizce (üst) + Türkçe (alt) */}
            <TouchableOpacity style={styles.wordSection} onPress={() => controls.current.openPlayer()} activeOpacity={0.8}>
              <Text style={styles.emoji}>🎧</Text>
              <View style={styles.wordInfo}>
                <Text style={[styles.wordEn, { color: c.textPrimary }]} numberOfLines={1}>
                  {nowPlaying.currentWord?.word}
                </Text>
                <Text style={[styles.wordTr, { color: c.textSecondary }]} numberOfLines={1}>
                  {nowPlaying.currentWord?.meaning}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Sağ: kontroller — ◀◀ ⏮ [▶/⏸] ⏭ ▶▶ */}
            <View style={styles.controls}>

              {/* Önceki liste ◀◀ */}
              <TouchableOpacity
                onPress={() => controls.current.skipPrevList()}
                disabled={!nowPlaying.hasPrevList}
                hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                style={[styles.doubleBtn, !nowPlaying.hasPrevList && styles.dimmed]}
              >
                <Ionicons name="caret-back" size={17} color={c.textPrimary} style={{ marginRight: -8 }} />
                <Ionicons name="caret-back" size={17} color={c.textPrimary} />
              </TouchableOpacity>

              {/* Önceki kelime ⏮ */}
              <TouchableOpacity
                onPress={() => controls.current.skipPrevWord()}
                hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                style={styles.navBtn}
              >
                <Ionicons name="play-skip-back" size={20} color={c.textPrimary} />
              </TouchableOpacity>

              {/* Oynat / Duraklat — büyük yuvarlak */}
              <TouchableOpacity
                onPress={() => controls.current.toggle()}
                style={[styles.playBtn, { backgroundColor: c.primary }]}
              >
                <Ionicons name={nowPlaying.isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
              </TouchableOpacity>

              {/* Sonraki kelime ⏭ */}
              <TouchableOpacity
                onPress={() => controls.current.skipNextWord()}
                hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                style={styles.navBtn}
              >
                <Ionicons name="play-skip-forward" size={20} color={c.textPrimary} />
              </TouchableOpacity>

              {/* Sonraki liste ▶▶ */}
              <TouchableOpacity
                onPress={() => controls.current.skipNextList()}
                disabled={!nowPlaying.hasNextList}
                hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                style={[styles.doubleBtn, !nowPlaying.hasNextList && styles.dimmed]}
              >
                <Ionicons name="caret-forward" size={17} color={c.textPrimary} style={{ marginRight: -8 }} />
                <Ionicons name="caret-forward" size={17} color={c.textPrimary} />
              </TouchableOpacity>

            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 14,
  },

  progressTrack: { height: 3 },
  progressFill:  { height: 3 },

  listNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 2,
    gap: 8,
  },
  listNameLine: { flex: 1, height: 1 },
  listNameText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 10,
  },

  wordSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji:   { fontSize: 36 },
  wordInfo: { flex: 1 },
  wordEn:  { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  wordTr:  { fontSize: 13, marginTop: 2 },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  doubleBtn: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  navBtn:    { padding: 6 },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  dimmed: { opacity: 0.25 },
});
