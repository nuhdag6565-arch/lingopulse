import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const SPEED_OPTIONS = [
  { label: '0.25x', value: '0.25' },
  { label: '0.5x',  value: '0.5'  },
  { label: '0.75x', value: '0.75' },
  { label: '1x',    value: '1.0'  },
  { label: '1.25x', value: '1.25' },
  { label: '1.5x',  value: '1.5'  },
  { label: '1.75x', value: '1.75' },
  { label: '2x',    value: '2.0'  },
];
import * as Speech from 'expo-speech';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { useWords, type Word } from '@/src/context/WordContext';
import { useTTS } from '@/src/context/TTSContext';
import { useNowPlaying } from '@/src/context/NowPlayingContext';
import { EmptyState } from '@/src/components/EmptyState';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';
import {
  initPlayerNotification,
  updatePlayerNotification,
  dismissPlayerNotification,
  ACTION_PREV,
  ACTION_PLAY_PAUSE,
  ACTION_NEXT,
  ACTION_STOP,
} from '@/src/services/podcastNotification';


function estimateDuration(wordCount: number): string {
  const mins = Math.max(1, Math.ceil((wordCount * 8) / 60));
  return `~${mins} dk`;
}

type ViewMode = 'lists' | 'player';
const W = 'rgba(255,255,255,';

const createStyles = (c: AppColorsType) =>
  StyleSheet.create({
    screen: { flex: 1 },

    // ─── Lists View ───────────────────────────────────────────────
    listsContainer: { flex: 1, backgroundColor: c.background },
    listsHeader: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
    title:    { fontSize: 24, fontWeight: '800', color: c.textPrimary },
    subtitle: { fontSize: 13, color: c.textSecondary, marginTop: 3 },
    listsContent: { paddingHorizontal: 16, paddingBottom: 16 },

    listCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: c.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    listCardActive: { borderColor: c.primary },
    listCardEmoji: { fontSize: 32, marginRight: 14 },
    listCardInfo:  { flex: 1 },
    listCardName:  { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    listCardMeta:  { fontSize: 12, color: c.textSecondary, marginTop: 2 },
    listCardBtn:   { padding: 4, marginLeft: 4 },

    loadingWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyWrapper:   { paddingTop: 60, paddingHorizontal: 16 },

    // ─── Mini Player ──────────────────────────────────────────────
    miniPlayer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: c.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 14,
    },
    miniProgressTrack:  { height: 3, backgroundColor: c.border },
    miniProgressFill:   { height: 3, backgroundColor: c.primary },
    miniListNameRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 14, paddingTop: 8, paddingBottom: 2, gap: 8,
    },
    miniListNameLine: { flex: 1, height: 1, backgroundColor: c.border },
    miniListNameText: { fontSize: 10, fontWeight: '600', color: c.textMuted, letterSpacing: 0.4 },
    miniPlayerInner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: 12,
      gap: 10,
    },
    miniPlayerSection:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    miniPlayerEmoji:    { fontSize: 36 },
    miniPlayerInfo:     { flex: 1 },
    miniPlayerWord:     { fontSize: 16, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.3 },
    miniPlayerList:     { fontSize: 13, color: c.textSecondary, marginTop: 2 },
    miniPlayerControls: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    miniPlayerBtn:      { padding: 6 },
    miniPlayerPlayBtn:  {
      width: 42, height: 42, borderRadius: 21,
      backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4,
    },
    miniPlayerDouble:   { flexDirection: 'row', alignItems: 'center', padding: 4 },
    miniPlayerDimmed:   { opacity: 0.25 },

    // ─── Player View ──────────────────────────────────────────────
    playerContainer: { flex: 1, backgroundColor: c.primary },

    playerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 54,
      paddingHorizontal: 20,
      paddingBottom: 6,
    },
    playerBackBtn:        { padding: 8 },
    playerHeaderCenter:   { flex: 1, alignItems: 'center' },
    playerHeaderLabel:    { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: `${W}0.5)`, textTransform: 'uppercase' },
    playerHeaderListName: { fontSize: 17, fontWeight: '800', color: '#fff', marginTop: 3, textAlign: 'center' },
    playerHeaderSpacer:   { width: 44 },

    // Art — flex: 1, kelime ve anlam burada ortalanır
    playerArtWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    playerArtEmoji:   { fontSize: 64, marginBottom: 24 },
    playerArtWord:    { fontSize: 36, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: -0.5, marginBottom: 14 },
    playerArtMeaning: { fontSize: 36, color: '#fff', fontWeight: '600', textAlign: 'center', lineHeight: 44 },

    // Alt panel — sabit yükseklik, kompakt
    playerBottomPanel: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 24,
    },

    // Phase pills
    phaseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 12,
    },
    phasePill:           { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: `${W}0.12)` },
    phasePillActive:     { backgroundColor: `${W}0.3)` },
    phasePillText:       { fontSize: 11, fontWeight: '700', color: `${W}0.5)` },
    phasePillTextActive: { color: '#fff' },

    // Progress
    playerProgressTrack: { height: 3, backgroundColor: `${W}0.18)`, borderRadius: 2, marginBottom: 6 },
    playerProgressFill:  { height: 3, backgroundColor: '#fff', borderRadius: 2 },
    playerProgressRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    playerProgressText:  { fontSize: 11, color: `${W}0.5)`, fontWeight: '600' },

    // Controls — 5 buton: <<liste  ⏮kelime  ▶/⏸  ⏭kelime  >>liste
    playerControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    playerCtrlBtn:    { padding: 6 },
    playerNavDisabled: { opacity: 0.28 },
    doubleArrowBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 6,
    },
    playerMainBtn: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 6,
    },

    // ─── Hız seçici (açılır/kapanır) ───
    playerBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    speedToggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 12,
      backgroundColor: `${W}0.14)`,
    },
    speedToggleText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    speedExpandedRow: { marginBottom: 4, marginTop: 8 },
    speedScroll:        {},
    speedScrollContent: { gap: 6 },
    speedBtn:           { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: `${W}0.14)` },
    speedBtnActive:     { backgroundColor: '#fff' },
    speedBtnText:       { fontSize: 12, fontWeight: '700', color: `${W}0.7)` },
    speedBtnTextActive: { color: c.primary },

    // ─── Listeler FAB (oynatıcı içinde sağ alt) ───
    playerListsFab: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${W}0.18)`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${W}0.25)`,
    },

    // ─── Listeler Bottom Sheet ───
    listSheetOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    listSheetBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    listSheet: {
      height: SCREEN_HEIGHT * 0.5,
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 10,
    },
    listSheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: 14,
    },
    listSheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    listSheetTitle:   { fontSize: 16, fontWeight: '700', color: c.textPrimary },
    listSheetContent: { paddingHorizontal: 14, paddingBottom: 24 },
    listSheetCard: {
      backgroundColor: c.background,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: c.border,
    },
    listSheetCardActive: { borderColor: c.primary },
    listSheetEmoji:      { fontSize: 26, marginRight: 12 },
    listSheetInfo:       { flex: 1 },
    listSheetName:       { fontSize: 14, fontWeight: '700', color: c.textPrimary },
    listSheetMeta:       { fontSize: 11, color: c.textSecondary, marginTop: 2 },
    listSheetLoading:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  });

// ─────────────────────────────────────────────────────────────────────────────

export default function PodcastScreen() {
  const { lists, isLoadingLists, loadLists, loadListWords, getListWords } = useWords();
  const { ttsRate, ttsSpeedValue, setTtsSpeed } = useTTS();
  const { setNowPlaying, controls: playerControls } = useNowPlaying();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  const [viewMode,          setViewMode]          = useState<ViewMode>('lists');
  const [playingListId,     setPlayingListId]     = useState<string | null>(null);
  const [playingWords,      setPlayingWords]      = useState<Word[]>([]);
  const [currentIndex,      setCurrentIndex]      = useState(0);
  const [isPlaying,         setIsPlaying]         = useState(false);
  const [phase,             setPhase]             = useState<'word' | 'meaning'>('word');
  const [loadingListId,     setLoadingListId]     = useState<string | null>(null);
  const [showListSheet,     setShowListSheet]     = useState(false);
  const [showSpeedSelector, setShowSpeedSelector] = useState(false);

  const cycleActive     = useRef(false);
  const currentIndexRef = useRef(0);
  const playingWordsRef = useRef<Word[]>([]);
  const ttsRateRef      = useRef(ttsRate);
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlersRef     = useRef({ togglePlayPause: () => {}, skipNextWord: () => {}, skipPrevWord: () => {}, stop: () => {} });
  const autoNextListRef = useRef<() => void>(() => {});

  // ── Aydınlanma animasyonları ──
  const wordOpacity    = useRef(new Animated.Value(1)).current;
  const meaningOpacity = useRef(new Animated.Value(0.28)).current;
  const meaningScale   = useRef(new Animated.Value(0.95)).current;
  const wordPillAnim    = useRef(new Animated.Value(0.5)).current;
  const meaningPillAnim = useRef(new Animated.Value(0.5)).current;
  const contentOpacity  = useRef(new Animated.Value(1)).current;
  const contentSlide    = useRef(new Animated.Value(0)).current;
  const shakeAnim       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) {
      Animated.parallel([
        Animated.timing(wordOpacity,     { toValue: 1,    duration: 300, useNativeDriver: true }),
        Animated.timing(meaningOpacity,  { toValue: 0.55, duration: 300, useNativeDriver: true }),
        Animated.timing(meaningScale,    { toValue: 1,    duration: 300, useNativeDriver: true }),
        Animated.timing(wordPillAnim,    { toValue: 0.5,  duration: 300, useNativeDriver: true }),
        Animated.timing(meaningPillAnim, { toValue: 0.5,  duration: 300, useNativeDriver: true }),
      ]).start();
      return;
    }
    if (phase === 'word') {
      Animated.parallel([
        Animated.timing(wordOpacity,     { toValue: 1,    duration: 220, useNativeDriver: true }),
        Animated.timing(meaningOpacity,  { toValue: 0.18, duration: 220, useNativeDriver: true }),
        Animated.timing(meaningScale,    { toValue: 0.92, duration: 220, useNativeDriver: true }),
        Animated.timing(wordPillAnim,    { toValue: 1,    duration: 220, useNativeDriver: true }),
        Animated.timing(meaningPillAnim, { toValue: 0.22, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(wordOpacity,     { toValue: 0.25, duration: 220, useNativeDriver: true }),
        Animated.timing(meaningOpacity,  { toValue: 1,    duration: 220, useNativeDriver: true }),
        Animated.timing(meaningScale,    { toValue: 1.10, duration: 220, useNativeDriver: true }),
        Animated.timing(wordPillAnim,    { toValue: 0.22, duration: 220, useNativeDriver: true }),
        Animated.timing(meaningPillAnim, { toValue: 1,    duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [phase, isPlaying]);

  useEffect(() => { ttsRateRef.current = ttsRate; }, [ttsRate]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
    initPlayerNotification().catch(() => {});
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const id = response.actionIdentifier;
      if      (id === ACTION_PLAY_PAUSE) handlersRef.current.togglePlayPause();
      else if (id === ACTION_NEXT)       handlersRef.current.skipNextWord();
      else if (id === ACTION_PREV)       handlersRef.current.skipPrevWord();
      else if (id === ACTION_STOP)       handlersRef.current.stop();
    });
    return () => sub.remove();
  }, []);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const stopAll = useCallback(() => {
    cycleActive.current = false;
    clearTimer();
    Speech.stop();
    setIsPlaying(false);
    dismissPlayerNotification().catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => {
    loadLists();
  }, [loadLists]));

  const speakCycle = useCallback((index: number) => {
    if (!cycleActive.current) return;
    const words = playingWordsRef.current;
    if (index >= words.length) {
      cycleActive.current = false;
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      timerRef.current = setTimeout(() => autoNextListRef.current(), 1200);
      return;
    }

    const w = words[index];
    setCurrentIndex(index);
    currentIndexRef.current = index;
    setPhase('word');

    Speech.speak(w.word, {
      language: 'en-US',
      rate: ttsRateRef.current,
      onDone: () => {
        if (!cycleActive.current) return;
        timerRef.current = setTimeout(() => {
          if (!cycleActive.current) return;
          setPhase('meaning');
          Speech.speak(w.meaning, {
            language: 'tr-TR',
            rate: ttsRateRef.current,
            onDone: () => {
              if (!cycleActive.current) return;
              timerRef.current = setTimeout(() => speakCycle(index + 1), 900);
            },
            onError: () => { if (cycleActive.current) timerRef.current = setTimeout(() => speakCycle(index + 1), 300); },
          });
        }, 450);
      },
      onError: () => { if (cycleActive.current) timerRef.current = setTimeout(() => speakCycle(index + 1), 300); },
    });
  }, []);

  const startList = useCallback(async (listId: string) => {
    // İçeriği kararıp aşağı kayarak soluklaştır
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 0,  duration: 180, useNativeDriver: true }),
      Animated.timing(contentSlide,   { toValue: 16, duration: 180, useNativeDriver: true }),
    ]).start();

    stopAll();
    setPlayingListId(listId);
    setLoadingListId(listId);
    setViewMode('player');

    let words = getListWords(listId);
    if (words.length === 0) words = await loadListWords(listId);
    setLoadingListId(null);
    if (words.length === 0) { setViewMode('lists'); return; }

    setPlayingWords(words);
    setCurrentIndex(0);
    playingWordsRef.current = words;
    currentIndexRef.current = 0;
    cycleActive.current = true;
    setIsPlaying(true);
    speakCycle(0);

    // Yukarıdan süzülerek belir + hafif titreme
    contentSlide.setValue(-20);
    shakeAnim.setValue(0);
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(contentSlide,   { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(120),
        Animated.timing(shakeAnim, { toValue: -5, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  5, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  3, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  0, duration: 35, useNativeDriver: true }),
      ]),
    ]).start();
  }, [stopAll, getListWords, loadListWords, speakCycle]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      cycleActive.current = false;
      clearTimer();
      Speech.stop();
      setIsPlaying(false);
    } else {
      if (!playingWordsRef.current.length) return;
      cycleActive.current = true;
      setIsPlaying(true);
      speakCycle(currentIndexRef.current);
    }
  }, [isPlaying, speakCycle]);

  const skipNextWord = useCallback(() => {
    clearTimer(); Speech.stop();
    const next = currentIndexRef.current + 1;
    if (next >= playingWordsRef.current.length) {
      cycleActive.current = false; setIsPlaying(false); setCurrentIndex(0); currentIndexRef.current = 0;
      dismissPlayerNotification().catch(() => {}); return;
    }
    if (cycleActive.current) { speakCycle(next); }
    else { setCurrentIndex(next); currentIndexRef.current = next; setPhase('word'); }
  }, [speakCycle]);

  const skipPrevWord = useCallback(() => {
    clearTimer(); Speech.stop();
    const prev = Math.max(0, currentIndexRef.current - 1);
    currentIndexRef.current = prev;
    if (cycleActive.current) { speakCycle(prev); }
    else { setCurrentIndex(prev); setPhase('word'); }
  }, [speakCycle]);

  useEffect(() => {
    handlersRef.current = { togglePlayPause, skipNextWord, skipPrevWord, stop: stopAll };
  });

  // Global mini-player: kontrolleri context'e kaydet
  useEffect(() => {
    playerControls.current.toggle      = togglePlayPause;
    playerControls.current.skipPrevWord = skipPrevWord;
    playerControls.current.skipNextWord = skipNextWord;
    playerControls.current.skipPrevList = skipPrevList;
    playerControls.current.skipNextList = skipNextList;
    playerControls.current.openPlayer  = () => {
      setViewMode('player');
      router.navigate('/(tabs)/podcast');
    };
  });

  useEffect(() => {
    autoNextListRef.current = () => {
      const idx = lists.findIndex((l) => l.id === playingListId);
      if (idx !== -1 && idx < lists.length - 1) {
        startList(lists[idx + 1].id);
      } else {
        setIsPlaying(false);
        dismissPlayerNotification().catch(() => {});
      }
    };
  });

  const currentListIndex = lists.findIndex((l) => l.id === playingListId);
  const hasPrevList = currentListIndex > 0;
  const hasNextList = currentListIndex !== -1 && currentListIndex < lists.length - 1;

  const skipNextList = useCallback(() => {
    if (currentListIndex === -1 || currentListIndex >= lists.length - 1) return;
    startList(lists[currentListIndex + 1].id);
  }, [lists, currentListIndex, startList]);

  const skipPrevList = useCallback(() => {
    if (currentListIndex <= 0) return;
    startList(lists[currentListIndex - 1].id);
  }, [lists, currentListIndex, startList]);

  const handleSpeedChange = useCallback(async (value: string) => {
    ttsRateRef.current = parseFloat(value);
    await setTtsSpeed(value);
    if (cycleActive.current) { clearTimer(); Speech.stop(); speakCycle(currentIndexRef.current); }
  }, [setTtsSpeed, speakCycle]);

  const currentList = lists.find((l) => l.id === playingListId);
  const currentWord = playingWords[currentIndex];
  const progress    = playingWords.length > 0 ? (currentIndex + 1) / playingWords.length : 0;
  const isListLoading = loadingListId === playingListId;

  // Durumu global mini-player context'ine senkronize et
  useEffect(() => {
    setNowPlaying({
      isPlaying,
      currentWord: currentWord ? { word: currentWord.word, meaning: currentWord.meaning } : null,
      currentListName: currentList?.name ?? null,
      progress,
      hasPrevList,
      hasNextList,
    });
  }, [isPlaying, currentIndex, playingListId, playingWords.length, hasPrevList, hasNextList]);

  useEffect(() => {
    if (!playingListId || !currentWord) return;
    updatePlayerNotification({
      listName: currentList?.name ?? '',
      word:     currentWord.word,
      meaning:  currentWord.meaning,
      index:    currentIndex,
      total:    playingWords.length,
      isPlaying,
    }).catch(() => {});
  }, [currentWord, isPlaying, currentList?.name, currentIndex, playingWords.length, playingListId]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>

      {/* ═══════════════════════  LISTS VIEW  ════════════════════════════ */}
      {viewMode === 'lists' && (
        <View style={styles.listsContainer}>
          <View style={styles.listsHeader}>
            <Text style={styles.title}>Dinle</Text>
            <Text style={styles.subtitle}>Kelimelerini podcast gibi dinle</Text>
          </View>

          {isLoadingLists && lists.length === 0 ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="large" color={c.primary} />
            </View>
          ) : lists.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <EmptyState
                icon="🎧"
                title="Henüz listeniz yok"
                description="Listelerim sekmesinden kelime listeleri oluşturun, burada podcast gibi dinleyin."
              />
            </View>
          ) : (
            <FlatList
              data={lists}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.listsContent,
                playingListId ? { paddingBottom: 84 } : undefined,
              ]}
              renderItem={({ item }) => {
                const isActive  = item.id === playingListId;
                const isLoading = item.id === loadingListId;
                return (
                  <TouchableOpacity
                    style={[styles.listCard, isActive && styles.listCardActive]}
                    onPress={() => isActive ? setViewMode('player') : startList(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.listCardEmoji}>🎧</Text>
                    <View style={styles.listCardInfo}>
                      <Text style={styles.listCardName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.listCardMeta}>{item.wordCount} kelime · {estimateDuration(item.wordCount)}</Text>
                    </View>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={c.primary} style={styles.listCardBtn} />
                    ) : (
                      <TouchableOpacity
                        style={styles.listCardBtn}
                        onPress={() => isActive ? togglePlayPause() : startList(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={isActive && isPlaying ? 'pause-circle' : 'play-circle'}
                          size={42}
                          color={isActive ? c.primary : c.textMuted}
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* ── Mini Player ── */}
          {playingListId && currentWord && (
            <View style={styles.miniPlayer}>

              {/* İnce ilerleme çubuğu */}
              <View style={styles.miniProgressTrack}>
                <View style={[styles.miniProgressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
              </View>

              {/* Liste adı — ince çizgiler arasında */}
              <View style={styles.miniListNameRow}>
                <View style={styles.miniListNameLine} />
                <Text style={styles.miniListNameText} numberOfLines={1}>{currentList?.name ?? ''}</Text>
                <View style={styles.miniListNameLine} />
              </View>

              {/* Ana satır: 🎧 kelimeler | ◀◀ ⏮ [▶/⏸] ⏭ ▶▶ */}
              <View style={styles.miniPlayerInner}>

                {/* Sol: emoji + İngilizce + Türkçe */}
                <TouchableOpacity style={styles.miniPlayerSection} onPress={() => setViewMode('player')} activeOpacity={0.8}>
                  <Text style={styles.miniPlayerEmoji}>🎧</Text>
                  <View style={styles.miniPlayerInfo}>
                    <Text style={styles.miniPlayerWord} numberOfLines={1}>{currentWord.word}</Text>
                    <Text style={styles.miniPlayerList} numberOfLines={1}>{currentWord.meaning}</Text>
                  </View>
                </TouchableOpacity>

                {/* Sağ: kontroller */}
                <View style={styles.miniPlayerControls}>

                  {/* Önceki liste ◀◀ */}
                  <TouchableOpacity
                    style={[styles.miniPlayerDouble, !hasPrevList && styles.miniPlayerDimmed]}
                    onPress={skipPrevList}
                    disabled={!hasPrevList}
                    hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                  >
                    <Ionicons name="caret-back" size={17} color={c.textPrimary} style={{ marginRight: -8 }} />
                    <Ionicons name="caret-back" size={17} color={c.textPrimary} />
                  </TouchableOpacity>

                  {/* Önceki kelime ⏮ */}
                  <TouchableOpacity style={styles.miniPlayerBtn} onPress={skipPrevWord} hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}>
                    <Ionicons name="play-skip-back" size={20} color={c.textPrimary} />
                  </TouchableOpacity>

                  {/* Oynat / Duraklat — büyük yuvarlak */}
                  <TouchableOpacity style={styles.miniPlayerPlayBtn} onPress={togglePlayPause}>
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
                  </TouchableOpacity>

                  {/* Sonraki kelime ⏭ */}
                  <TouchableOpacity style={styles.miniPlayerBtn} onPress={skipNextWord} hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}>
                    <Ionicons name="play-skip-forward" size={20} color={c.textPrimary} />
                  </TouchableOpacity>

                  {/* Sonraki liste ▶▶ */}
                  <TouchableOpacity
                    style={[styles.miniPlayerDouble, !hasNextList && styles.miniPlayerDimmed]}
                    onPress={skipNextList}
                    disabled={!hasNextList}
                    hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                  >
                    <Ionicons name="caret-forward" size={17} color={c.textPrimary} style={{ marginRight: -8 }} />
                    <Ionicons name="caret-forward" size={17} color={c.textPrimary} />
                  </TouchableOpacity>

                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ═══════════════════════  PLAYER VIEW  ═══════════════════════════ */}
      {viewMode === 'player' && (
        <View style={styles.playerContainer}>

          {/* Başlık */}
          <View style={styles.playerHeader}>
            <TouchableOpacity
              style={styles.playerBackBtn}
              onPress={() => setViewMode('lists')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-down" size={28} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            <View style={styles.playerHeaderCenter}>
              <Text style={styles.playerHeaderLabel}>ŞU AN ÇALINIYOR</Text>
              <Animated.Text style={[styles.playerHeaderListName, { opacity: contentOpacity }]} numberOfLines={1}>{currentList?.name ?? ''}</Animated.Text>
            </View>
            <View style={styles.playerHeaderSpacer} />
          </View>

          {/* Kelime — ekranın ortası, phase'e göre aydınlanır + liste geçişinde kayarak girer */}
          <Animated.View style={[styles.playerArtWrapper, { opacity: contentOpacity, transform: [{ translateY: contentSlide }, { translateX: shakeAnim }] }]}>
            <Text style={styles.playerArtEmoji}>🎧</Text>
            <Animated.Text style={[styles.playerArtWord, { opacity: wordOpacity }]} numberOfLines={2}>
              {isListLoading ? 'Yükleniyor...' : (currentWord?.word ?? '')}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.playerArtMeaning,
                { opacity: meaningOpacity, transform: [{ scale: meaningScale }] },
              ]}
              numberOfLines={2}
            >
              {isListLoading ? '' : (currentWord?.meaning ?? '')}
            </Animated.Text>
          </Animated.View>

          {/* Alt panel — kontroller */}
          <View style={styles.playerBottomPanel}>

            {/* Faz göstergesi — animasyonlu aydınlanma */}
            {currentWord && (
              <View style={styles.phaseRow}>
                <Animated.View style={[styles.phasePill, styles.phasePillActive, { opacity: wordPillAnim }]}>
                  <Text style={styles.phasePillTextActive}>Kelime</Text>
                </Animated.View>
                <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.25)" />
                <Animated.View style={[styles.phasePill, styles.phasePillActive, { opacity: meaningPillAnim }]}>
                  <Text style={styles.phasePillTextActive}>Anlam</Text>
                </Animated.View>
              </View>
            )}

            {/* İlerleme çubuğu */}
            <View style={styles.playerProgressTrack}>
              <View style={[styles.playerProgressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
            </View>
            <View style={styles.playerProgressRow}>
              <Text style={styles.playerProgressText}>{currentIndex + 1}</Text>
              <Text style={styles.playerProgressText}>{playingWords.length}</Text>
            </View>

            {/* Kontroller: <<liste  ⏮kelime  ▶/⏸  ⏭kelime  >>liste */}
            <View style={styles.playerControls}>

              {/* Önceki Liste — çift ok << */}
              <TouchableOpacity
                style={[styles.doubleArrowBtn, !hasPrevList && styles.playerNavDisabled]}
                onPress={skipPrevList}
                disabled={!hasPrevList}
                activeOpacity={0.7}
              >
                <Ionicons name="caret-back" size={24} color="rgba(255,255,255,0.85)" style={{ marginRight: -11 }} />
                <Ionicons name="caret-back" size={24} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>

              {/* Önceki Kelime */}
              <TouchableOpacity style={styles.playerCtrlBtn} onPress={skipPrevWord} activeOpacity={0.7}>
                <Ionicons name="play-skip-back" size={24} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>

              {/* Oynat / Duraklat */}
              <TouchableOpacity style={styles.playerMainBtn} onPress={togglePlayPause} activeOpacity={0.85}>
                {isListLoading ? (
                  <ActivityIndicator size="small" color={c.primary} />
                ) : (
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={26}
                    color={c.primary}
                    style={{ marginLeft: isPlaying ? 0 : 3 }}
                  />
                )}
              </TouchableOpacity>

              {/* Sonraki Kelime */}
              <TouchableOpacity style={styles.playerCtrlBtn} onPress={skipNextWord} activeOpacity={0.7}>
                <Ionicons name="play-skip-forward" size={24} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>

              {/* Sonraki Liste — çift ok >> */}
              <TouchableOpacity
                style={[styles.doubleArrowBtn, !hasNextList && styles.playerNavDisabled]}
                onPress={skipNextList}
                disabled={!hasNextList}
                activeOpacity={0.7}
              >
                <Ionicons name="caret-forward" size={24} color="rgba(255,255,255,0.85)" style={{ marginRight: -11 }} />
                <Ionicons name="caret-forward" size={24} color="rgba(255,255,255,0.85)" />
              </TouchableOpacity>

            </View>

            {/* Hız seçici — açılınca görünür */}
            {showSpeedSelector && (
              <View style={styles.speedExpandedRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.speedScroll}
                  contentContainerStyle={styles.speedScrollContent}
                >
                  {SPEED_OPTIONS.map((opt) => {
                    const active = ttsSpeedValue === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.speedBtn, active && styles.speedBtnActive]}
                        onPress={() => { handleSpeedChange(opt.value); setShowSpeedSelector(false); }}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.speedBtnText, active && styles.speedBtnTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Alt satır: Hız toggle + Listeler butonu */}
            <View style={styles.playerBottomRow}>
              <TouchableOpacity
                style={styles.speedToggleBtn}
                onPress={() => setShowSpeedSelector(!showSpeedSelector)}
                activeOpacity={0.8}
              >
                <Ionicons name="speedometer-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.speedToggleText}>
                  {SPEED_OPTIONS.find(o => o.value === ttsSpeedValue)?.label ?? `${ttsSpeedValue}x`}
                </Text>
                <Ionicons
                  name={showSpeedSelector ? 'chevron-down' : 'chevron-up'}
                  size={12}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playerListsFab}
                onPress={() => setShowListSheet(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="albums" size={20} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            </View>

          </View>
        </View>
      )}

      {/* ═══════════════════  LİSTELER BOTTOM SHEET  ═══════════════════ */}
      <Modal
        visible={showListSheet}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowListSheet(false)}
      >
        <View style={styles.listSheetOverlay}>
          <TouchableOpacity
            style={styles.listSheetBackdrop}
            onPress={() => setShowListSheet(false)}
            activeOpacity={1}
          />
          <View style={styles.listSheet}>
            <View style={styles.listSheetHandle} />
            <View style={styles.listSheetHeader}>
              <Text style={styles.listSheetTitle}>Listeler · {lists.length}</Text>
              <TouchableOpacity onPress={() => setShowListSheet(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={c.textSecondary} />
              </TouchableOpacity>
            </View>

            {isLoadingLists && lists.length === 0 ? (
              <View style={styles.listSheetLoading}>
                <ActivityIndicator size="large" color={c.primary} />
              </View>
            ) : (
              <FlatList
                data={lists}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listSheetContent}
                renderItem={({ item }) => {
                  const isActive  = item.id === playingListId;
                  const isLoading = item.id === loadingListId;
                  return (
                    <TouchableOpacity
                      style={[styles.listSheetCard, isActive && styles.listSheetCardActive]}
                      onPress={() => {
                        isActive ? togglePlayPause() : startList(item.id);
                        setShowListSheet(false);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.listSheetEmoji}>🎧</Text>
                      <View style={styles.listSheetInfo}>
                        <Text style={styles.listSheetName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.listSheetMeta}>{item.wordCount} kelime · {estimateDuration(item.wordCount)}</Text>
                      </View>
                      {isLoading ? (
                        <ActivityIndicator size="small" color={c.primary} />
                      ) : (
                        <Ionicons
                          name={isActive && isPlaying ? 'pause-circle' : 'play-circle'}
                          size={36}
                          color={isActive ? c.primary : c.textMuted}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}
