import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useWords, type Word } from '@/src/context/WordContext';
import { useTTS } from '@/src/context/TTSContext';
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

function estimateDuration(wordCount: number): string {
  const mins = Math.max(1, Math.ceil((wordCount * 8) / 60));
  return `~${mins} dk`;
}

const W = 'rgba(255,255,255,';

const createStyles = (c: AppColorsType) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    listContent: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 120 },

    header: { marginBottom: 28 },
    title: { fontSize: 24, fontWeight: '800', color: c.textPrimary },
    subtitle: { fontSize: 13, color: c.textSecondary, marginTop: 3 },

    // ── Player card ──
    playerCard: {
      borderRadius: 28,
      padding: 28,
      marginBottom: 40,
      backgroundColor: c.primary,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.38,
      shadowRadius: 24,
      elevation: 14,
    },
    playerEpisodeLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: `${W}0.55)`,
      marginBottom: 24,
      textAlign: 'center',
    },
    playerWord: {
      fontSize: 46,
      fontWeight: '800',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: -1,
    },
    playerMeaning: {
      fontSize: 20,
      color: `${W}0.88)`,
      textAlign: 'center',
      marginBottom: 10,
      minHeight: 30,
      lineHeight: 28,
    },
    phaseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 26,
    },
    phasePill: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: `${W}0.15)`,
    },
    phasePillActive:     { backgroundColor: `${W}0.35)` },
    phasePillText:       { fontSize: 12, fontWeight: '700', color: `${W}0.55)` },
    phasePillTextActive: { color: '#fff' },

    progressTrack: {
      height: 5,
      backgroundColor: `${W}0.2)`,
      borderRadius: 3,
      marginBottom: 7,
    },
    progressFill:  { height: 5, backgroundColor: '#fff', borderRadius: 3 },
    progressLabel: { fontSize: 12, color: `${W}0.6)`, textAlign: 'right', marginBottom: 22 },

    divider: { height: 1, backgroundColor: `${W}0.15)`, marginBottom: 16 },

    // ── Hız seçici ──
    speedHeader: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: `${W}0.5)`,
      textAlign: 'center',
      marginBottom: 10,
    },
    speedScroll:        { marginBottom: 22 },
    speedScrollContent: { gap: 7, paddingHorizontal: 2 },
    speedBtn:           { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 12, backgroundColor: `${W}0.14)` },
    speedBtnActive:     { backgroundColor: '#fff' },
    speedBtnText:       { fontSize: 12, fontWeight: '700', color: `${W}0.7)` },
    speedBtnTextActive: { color: c.primary },

    // ── Liste navigasyonu ──
    listNavRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    listNavBtn:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, backgroundColor: `${W}0.14)` },
    listNavBtnDisabled: { opacity: 0.3 },
    listNavText:        { fontSize: 12, fontWeight: '700', color: '#fff' },
    listNavCenter:      { alignItems: 'center', gap: 2 },
    listNavCountText:   { fontSize: 11, color: `${W}0.5)`, fontWeight: '600' },

    // ── Kelime kontrolleri ──
    wordControlsLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
      color: `${W}0.5)`,
      textAlign: 'center',
      marginBottom: 12,
    },
    wordControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36 },
    ctrlBtn: { padding: 8 },
    mainBtn: {
      width: 74, height: 74, borderRadius: 37, backgroundColor: '#fff',
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 6,
    },

    // ── Bölüm listesi ──
    sectionLabel:     { fontSize: 14, fontWeight: '800', color: c.textPrimary, marginBottom: 14 },
    episodeCard:      { backgroundColor: c.surface, borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: c.border },
    episodeCardActive: { borderColor: c.primary },
    episodeEmoji:     { fontSize: 30, marginRight: 14 },
    episodeInfo:      { flex: 1 },
    episodeName:      { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    episodeMeta:      { fontSize: 12, color: c.textSecondary, marginTop: 3 },
    episodeBtn:       { padding: 4 },

    emptyWrapper:   { paddingTop: 60 },
    loadingWrapper: { paddingTop: 80, alignItems: 'center' },
  });

// ─────────────────────────────────────────────────────────────────────────────

export default function PodcastScreen() {
  const { lists, isLoadingLists, loadLists, loadListWords, getListWords } = useWords();
  const { ttsRate, ttsSpeedValue, setTtsSpeed } = useTTS();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  const [playingListId, setPlayingListId] = useState<string | null>(null);
  const [playingWords,  setPlayingWords]  = useState<Word[]>([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [phase,         setPhase]         = useState<'word' | 'meaning'>('word');
  const [loadingListId, setLoadingListId] = useState<string | null>(null);

  const cycleActive     = useRef(false);
  const currentIndexRef = useRef(0);
  const playingWordsRef = useRef<Word[]>([]);
  const ttsRateRef      = useRef(ttsRate);
  const timerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bildirim aksiyonlarının her zaman güncel handler'ları çağırması için ref
  const handlersRef = useRef({
    togglePlayPause: () => {},
    skipNextWord:    () => {},
    skipPrevWord:    () => {},
    stop:            () => {},
  });

  useEffect(() => { ttsRateRef.current = ttsRate; }, [ttsRate]);

  // ── Ses oturumu — arka planda çalmayı etkinleştir ──
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

  // ── Bildirim aksiyon butonlarını dinle ──
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const id = response.actionIdentifier;
      if (id === ACTION_PLAY_PAUSE) handlersRef.current.togglePlayPause();
      else if (id === ACTION_NEXT)  handlersRef.current.skipNextWord();
      else if (id === ACTION_PREV)  handlersRef.current.skipPrevWord();
      else if (id === ACTION_STOP)  handlersRef.current.stop();
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
    return () => {
      cycleActive.current = false;
      clearTimer();
      Speech.stop();
      setIsPlaying(false);
      // Ekrandan çıkınca bildirimi koru — arka planda oynatmaya devam edilebilir
    };
  }, [loadLists]));

  // ── Kelime okuma döngüsü ──
  const speakCycle = useCallback((index: number) => {
    if (!cycleActive.current) return;
    const words = playingWordsRef.current;
    if (index >= words.length) {
      cycleActive.current = false;
      setIsPlaying(false);
      setCurrentIndex(0);
      currentIndexRef.current = 0;
      dismissPlayerNotification().catch(() => {});
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
    stopAll();
    setPlayingListId(listId);
    setLoadingListId(listId);

    let words = getListWords(listId);
    if (words.length === 0) words = await loadListWords(listId);
    setLoadingListId(null);
    if (words.length === 0) return;

    setPlayingWords(words);
    setCurrentIndex(0);
    playingWordsRef.current = words;
    currentIndexRef.current = 0;
    cycleActive.current = true;
    setIsPlaying(true);
    speakCycle(0);
  }, [stopAll, getListWords, loadListWords, speakCycle]);

  // ── Kelime navigasyonu ──
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

  // handlersRef'i her render'da güncelle
  useEffect(() => {
    handlersRef.current = { togglePlayPause, skipNextWord, skipPrevWord, stop: stopAll };
  });

  // ── Liste navigasyonu ──
  const currentListIndex = lists.findIndex((l) => l.id === playingListId);

  const skipNextList = useCallback(() => {
    if (currentListIndex === -1 || currentListIndex >= lists.length - 1) return;
    startList(lists[currentListIndex + 1].id);
  }, [lists, currentListIndex, startList]);

  const skipPrevList = useCallback(() => {
    if (currentListIndex <= 0) return;
    startList(lists[currentListIndex - 1].id);
  }, [lists, currentListIndex, startList]);

  // ── Hız değiştirme ──
  const handleSpeedChange = useCallback(async (value: string) => {
    ttsRateRef.current = parseFloat(value);
    await setTtsSpeed(value);
    if (cycleActive.current) { clearTimer(); Speech.stop(); speakCycle(currentIndexRef.current); }
  }, [setTtsSpeed, speakCycle]);

  // ── Bildirim güncelle ──
  const currentList = lists.find((l) => l.id === playingListId);
  const currentWord = playingWords[currentIndex];
  const progress    = playingWords.length > 0 ? (currentIndex + 1) / playingWords.length : 0;
  const hasPrevList = currentListIndex > 0;
  const hasNextList = currentListIndex !== -1 && currentListIndex < lists.length - 1;

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

  // ── Oynatıcı kartı ──
  const playerCard = playingListId && currentWord ? (
    <View style={styles.playerCard}>

      <Text style={styles.playerEpisodeLabel}>{currentList?.name ?? ''}</Text>

      <Text style={styles.playerWord}>{currentWord.word}</Text>
      <Text style={styles.playerMeaning}>
        {phase === 'meaning' || !isPlaying ? currentWord.meaning : ' '}
      </Text>

      <View style={styles.phaseRow}>
        <View style={[styles.phasePill, phase === 'word' && isPlaying && styles.phasePillActive]}>
          <Text style={[styles.phasePillText, phase === 'word' && isPlaying && styles.phasePillTextActive]}>Kelime</Text>
        </View>
        <Ionicons name="arrow-forward" size={13} color="rgba(255,255,255,0.35)" />
        <View style={[styles.phasePill, phase === 'meaning' && isPlaying && styles.phasePillActive]}>
          <Text style={[styles.phasePillText, phase === 'meaning' && isPlaying && styles.phasePillTextActive]}>Anlam</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{currentIndex + 1} / {playingWords.length}</Text>

      {/* Hız seçici */}
      <View style={styles.divider} />
      <Text style={styles.speedHeader}>OYNATMA HIZI</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speedScroll} contentContainerStyle={styles.speedScrollContent}>
        {SPEED_OPTIONS.map((opt) => {
          const active = ttsSpeedValue === opt.value;
          return (
            <TouchableOpacity key={opt.value} style={[styles.speedBtn, active && styles.speedBtnActive]} onPress={() => handleSpeedChange(opt.value)} activeOpacity={0.75}>
              <Text style={[styles.speedBtnText, active && styles.speedBtnTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Liste navigasyonu */}
      <View style={styles.divider} />
      <View style={styles.listNavRow}>
        <TouchableOpacity style={[styles.listNavBtn, !hasPrevList && styles.listNavBtnDisabled]} onPress={skipPrevList} disabled={!hasPrevList} activeOpacity={0.75}>
          <Ionicons name="albums" size={15} color="#fff" />
          <Text style={styles.listNavText}>Önceki</Text>
        </TouchableOpacity>
        <View style={styles.listNavCenter}>
          <Ionicons name="list" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.listNavCountText}>{currentListIndex + 1} / {lists.length}</Text>
        </View>
        <TouchableOpacity style={[styles.listNavBtn, !hasNextList && styles.listNavBtnDisabled]} onPress={skipNextList} disabled={!hasNextList} activeOpacity={0.75}>
          <Text style={styles.listNavText}>Sonraki</Text>
          <Ionicons name="albums" size={15} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Kelime kontrolleri */}
      <Text style={styles.wordControlsLabel}>KELİME GEÇİŞİ</Text>
      <View style={styles.wordControls}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={skipPrevWord} activeOpacity={0.7}>
          <Ionicons name="play-skip-back" size={32} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mainBtn} onPress={togglePlayPause} activeOpacity={0.85}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={c.primary} style={{ marginLeft: isPlaying ? 0 : 3 }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={skipNextWord} activeOpacity={0.7}>
          <Ionicons name="play-skip-forward" size={32} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>

    </View>
  ) : null;

  // ── Render ──
  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Dinle</Text>
              <Text style={styles.subtitle}>Kelimelerini podcast gibi dinle</Text>
            </View>
            {playerCard}
            {lists.length > 0 && <Text style={styles.sectionLabel}>Listeler · {lists.length}</Text>}
          </>
        }
        ListEmptyComponent={
          isLoadingLists ? (
            <View style={styles.loadingWrapper}><ActivityIndicator size="large" color={c.primary} /></View>
          ) : (
            <View style={styles.emptyWrapper}>
              <EmptyState icon="🎧" title="Henüz listeniz yok" description="Listelerim sekmesinden kelime listeleri oluşturun, burada podcast gibi dinleyin." />
            </View>
          )
        }
        renderItem={({ item }) => {
          const isActive  = item.id === playingListId;
          const isLoading = item.id === loadingListId;
          return (
            <TouchableOpacity
              style={[styles.episodeCard, isActive && styles.episodeCardActive]}
              onPress={() => (isActive ? togglePlayPause() : startList(item.id))}
              activeOpacity={0.88}
            >
              <Text style={styles.episodeEmoji}>🎧</Text>
              <View style={styles.episodeInfo}>
                <Text style={styles.episodeName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.episodeMeta}>{item.wordCount} kelime · {estimateDuration(item.wordCount)}</Text>
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color={c.primary} />
              ) : (
                <TouchableOpacity style={styles.episodeBtn} onPress={() => startList(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={isActive && isPlaying ? 'pause-circle' : 'play-circle'} size={40} color={isActive ? c.primary : c.textMuted} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
