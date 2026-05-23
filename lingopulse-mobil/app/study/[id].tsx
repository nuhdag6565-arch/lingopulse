import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWords, type Word } from '@/src/context/WordContext';
import { FlashCard } from '@/src/components/FlashCard';
import { AppColors } from '@/src/constants/colors';

export default function StudyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getList, loadListWords } = useWords();

  const [current, setCurrent] = useState<Word | null>(null);
  const [queue, setQueue] = useState<Word[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [knewCount, setKnewCount] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const totalRef = useRef(0);
  const wordsRef = useRef<Word[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const startSession = useCallback(
    (words: Word[]) => {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      totalRef.current = shuffled.length;
      setCurrent(shuffled[0] ?? null);
      setQueue(shuffled.slice(1));
      setFlipped(false);
      setFinished(false);
      setKnewCount(0);
      setTransitioning(false);
      setLoading(false);
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      if (!id) return;

      loadListWords(id).then((words) => {
        if (!active) return;
        wordsRef.current = words;
        startSession(words);
      });

      return () => { active = false; };
    }, [id, loadListWords, startSession]),
  );

  // Fade-out → update state → fade-in
  const transition = useCallback(
    (fn: () => void) => {
      setTransitioning(true);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        fn();
        setTransitioning(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  const handleKnew = useCallback(() => {
    if (transitioning) return;
    transition(() => {
      setKnewCount((n) => n + 1);
      if (queue.length === 0) {
        setFinished(true);
      } else {
        setCurrent(queue[0]);
        setQueue((q) => q.slice(1));
        setFlipped(false);
      }
    });
  }, [queue, transition, transitioning]);

  const handleDidNotKnow = useCallback(() => {
    if (transitioning || !current) return;
    const snap = current;
    transition(() => {
      setQueue((q) => {
        const newQ = [...q, snap];
        setCurrent(newQ[0]);
        return newQ.slice(1);
      });
      setFlipped(false);
    });
  }, [current, transition, transitioning]);

  const handleTap = useCallback(() => {
    if (!transitioning) setFlipped((f) => !f);
  }, [transitioning]);

  const list = getList(id ?? '');
  const total = totalRef.current;
  const remaining = current && !finished ? queue.length + 1 : 0;
  const progress = total > 0 ? knewCount / total : 0;

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  // ─── Empty ──────────────────────────────────────────────────────────────────
  if (!current && !finished) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.bigEmoji}>📚</Text>
        <Text style={styles.centerTitle}>Bu listede kelime yok</Text>
        <Text style={styles.centerDesc}>Önce listeye kelime ekleyip tekrar dene.</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Listeye Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Finished ───────────────────────────────────────────────────────────────
  if (finished) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.bigEmoji}>🎉</Text>
        <Text style={styles.centerTitle}>Tebrikler!</Text>
        <Text style={styles.centerDesc}>
          {list?.name ?? 'Liste'} listesindeki{'\n'}tüm kelimeleri bitirdin.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{total}</Text>
            <Text style={styles.statLbl}>Toplam</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#059669' }]}>{knewCount}</Text>
            <Text style={styles.statLbl}>Bilinen</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#DC2626' }]}>{total - knewCount}</Text>
            <Text style={styles.statLbl}>Tekrar Eden</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => startSession(wordsRef.current)}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Tekrar Çalış</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Listeye Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Study session ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {list?.name ?? 'Çalışma'}
        </Text>
        <Text style={styles.counter}>{remaining} / {total}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Card */}
      <Animated.View style={[styles.cardArea, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={handleTap} activeOpacity={0.97} style={styles.cardTouch}>
          <FlashCard key={current!.id} word={current!} revealed={flipped} />
        </TouchableOpacity>
      </Animated.View>

      {/* Actions */}
      <View style={styles.actionsArea}>
        {!flipped ? (
          <View style={styles.flipHintRow}>
            <Ionicons name="sync-outline" size={15} color={AppColors.textMuted} />
            <Text style={styles.flipHintText}>Kartı çevirmek için dokun</Text>
          </View>
        ) : (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.noBtn]}
              onPress={handleDidNotKnow}
              activeOpacity={0.85}
              disabled={transitioning}
            >
              <Text style={styles.btnEmoji}>❌</Text>
              <Text style={styles.noBtnText}>Bilmiyorum</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.yesBtn]}
              onPress={handleKnew}
              activeOpacity={0.85}
              disabled={transitioning}
            >
              <Text style={styles.btnEmoji}>✅</Text>
              <Text style={styles.yesBtnText}>Biliyorum</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  counter: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },

  // Progress
  progressTrack: {
    height: 6,
    backgroundColor: AppColors.border,
    borderRadius: 3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 3,
  },

  // Card area — card is centered but pushed slightly upward via paddingBottom
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  cardTouch: {
    width: '100%',
  },

  // Actions
  actionsArea: {
    paddingBottom: 36,
    paddingTop: 8,
    minHeight: 90,
    justifyContent: 'center',
  },
  flipHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  flipHintText: {
    fontSize: 13,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  noBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    shadowColor: '#DC2626',
  },
  yesBtn: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    shadowColor: '#059669',
  },
  btnEmoji: {
    fontSize: 22,
  },
  noBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  yesBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },

  // Finished / Empty screens
  bigEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  centerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  centerDesc: {
    fontSize: 15,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 28,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  statLbl: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: AppColors.border,
    marginVertical: 4,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 32,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
});
