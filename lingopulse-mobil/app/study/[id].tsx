import { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWords, type Word } from '@/src/context/WordContext';
import { FlashCard } from '@/src/components/FlashCard';
import { useAppColors, type AppColorsType } from '@/src/context/ThemeContext';

const SCREEN_W = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

type SessionMode = 'review' | 'quiz' | 'finished';

interface QuizQ {
  word: Word;
  options: string[];
  correctIdx: number;
}

function buildQuestion(word: Word, allWords: Word[]): QuizQ {
  const candidates = allWords.filter((w) => w.id !== word.id && w.meaning !== word.meaning);
  const distractor = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
  const correctIdx = Math.random() < 0.5 ? 0 : 1;
  const opts = ['', ''];
  opts[correctIdx] = word.meaning;
  opts[1 - correctIdx] = distractor?.meaning ?? '—';
  return { word, options: opts, correctIdx };
}

const createStyles = (c: AppColorsType) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, paddingTop: 60, paddingHorizontal: 20 },
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface,
    borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center',
  },
  headerMid: { flex: 1, gap: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: c.textPrimary },
  modeLabel: { fontSize: 11, fontWeight: '600', color: c.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  counter: { fontSize: 14, fontWeight: '600', color: c.textSecondary },
  progressTrack: { height: 6, backgroundColor: c.border, borderRadius: 3, marginBottom: 24, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: c.primary, borderRadius: 3 },
  deckArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  ghostCard: { position: 'absolute', width: '100%', borderRadius: 20, overflow: 'hidden' },
  ghostCard2: { top: 8, transform: [{ scale: 0.96 }], opacity: 0.55 },
  ghostCard3: { top: 16, transform: [{ scale: 0.92 }], opacity: 0.3 },
  ghostCardInner: { height: 280, backgroundColor: c.surface, borderRadius: 20, borderWidth: 1.5, borderColor: c.border },
  topCardWrap: { width: '100%' },
  actionsArea: { paddingBottom: 36, paddingTop: 8, alignItems: 'center', gap: 10 },
  flipHintRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  flipHintText: { fontSize: 12, color: c.textMuted, fontWeight: '500' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: c.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32,
    shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 5,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  quizArea: { flex: 1, paddingBottom: 24 },
  quizWordCard: {
    backgroundColor: c.surface, borderRadius: 20, borderWidth: 1.5, borderColor: c.border,
    padding: 28, alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  quizWordLabel: { fontSize: 11, fontWeight: '700', color: c.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  quizWordText: { fontSize: 28, fontWeight: '800', color: c.textPrimary, textAlign: 'center' },
  quizPrompt: { fontSize: 14, fontWeight: '600', color: c.textSecondary, textAlign: 'center', marginBottom: 18 },
  optionsCol: { gap: 12 },
  optionBtn: {
    backgroundColor: c.surface, borderRadius: 16, borderWidth: 1.5, borderColor: c.border,
    paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  optionBtnText: { fontSize: 16, fontWeight: '600', color: c.textPrimary, textAlign: 'center' },
  optionCorrect: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  optionWrong: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  bigEmoji: { fontSize: 64, marginBottom: 16 },
  centerTitle: { fontSize: 24, fontWeight: '800', color: c.textPrimary, textAlign: 'center', marginBottom: 8 },
  centerDesc: { fontSize: 15, color: c.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  statsRow: {
    flexDirection: 'row', backgroundColor: c.surface, borderRadius: 16,
    borderWidth: 1, borderColor: c.border, paddingVertical: 16, paddingHorizontal: 8, marginBottom: 28, width: '100%',
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 26, fontWeight: '800', color: c.textPrimary },
  statLbl: { fontSize: 11, fontWeight: '600', color: c.textSecondary },
  statDivider: { width: 1, backgroundColor: c.border, marginVertical: 4 },
  secondaryBtn: {
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%',
    alignItems: 'center', borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: c.textSecondary },
});

export default function StudyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getList, loadListWords } = useWords();
  const c = useAppColors();
  const styles = useMemo(() => createStyles(c), [c]);

  const [loading, setLoading] = useState(true);
  const [sessionMode, setSessionMode] = useState<SessionMode>('review');

  const [reviewQueue, setReviewQueue] = useState<Word[]>([]);
  const [flipped, setFlipped] = useState(false);
  const reviewTotalRef = useRef(0);

  const [, setQuizQueue] = useState<Word[]>([]);
  const [currentQ, setCurrentQ] = useState<QuizQ | null>(null);
  const [answered, setAnswered] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const quizTotalRef = useRef(0);

  const wordsRef = useRef<Word[]>([]);
  const reviewStateRef = useRef<{
    queue: Word[];
    flipped: boolean;
    startQuiz: (words: Word[]) => void;
  }>({ queue: [], flipped: false, startQuiz: () => {} });

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cardPan = useRef(new Animated.ValueXY()).current;
  const transitioningRef = useRef(false);

  const crossfade = useCallback(
    (fn: () => void) => {
      if (transitioningRef.current) return;
      transitioningRef.current = true;
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        fn();
        transitioningRef.current = false;
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      });
    },
    [fadeAnim],
  );

  const startQuiz = useCallback(
    (words: Word[]) => {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      quizTotalRef.current = shuffled.length;
      setQuizQueue(shuffled);
      setCurrentQ(buildQuestion(shuffled[0], wordsRef.current));
      setAnswered(null);
      setCorrectCount(0);
      setWrongCount(0);
      crossfade(() => setSessionMode('quiz'));
    },
    [crossfade],
  );

  const advanceReview = useCallback(() => {
    if (transitioningRef.current) return;
    const { queue, startQuiz: doStartQuiz } = reviewStateRef.current;
    cardPan.setValue({ x: 0, y: 0 });
    crossfade(() => {
      if (queue.length === 0) {
        doStartQuiz(wordsRef.current);
      } else {
        setReviewQueue(queue.slice(1));
        setFlipped(false);
      }
    });
  }, [cardPan, crossfade]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderMove: Animated.event([null, { dx: cardPan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD || Math.abs(g.vx) > 0.8) {
          const dir = g.dx > 0 ? 1 : -1;
          Animated.timing(cardPan, { toValue: { x: dir * SCREEN_W * 1.4, y: 0 }, duration: 220, useNativeDriver: false }).start(() => {
            const { queue, startQuiz: doStartQuiz } = reviewStateRef.current;
            cardPan.setValue({ x: 0, y: 0 });
            if (queue.length === 0) {
              doStartQuiz(wordsRef.current);
            } else {
              setReviewQueue(queue.slice(1));
              setFlipped(false);
            }
          });
        } else {
          Animated.spring(cardPan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    }),
  ).current;

  reviewStateRef.current = { queue: reviewQueue, flipped, startQuiz };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      if (!id) return;
      loadListWords(id).then((words) => {
        if (!active) return;
        wordsRef.current = words;
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        reviewTotalRef.current = shuffled.length;
        setReviewQueue(shuffled);
        setFlipped(false);
        setSessionMode('review');
        setLoading(false);
        cardPan.setValue({ x: 0, y: 0 });
      });
      return () => { active = false; };
    }, [id, loadListWords, cardPan]),
  );

  const handleAnswer = useCallback(
    (idx: number) => {
      if (answered !== null || !currentQ) return;
      const isCorrect = idx === currentQ.correctIdx;
      setAnswered(idx);
      if (isCorrect) setCorrectCount((prev) => prev + 1);
      else setWrongCount((prev) => prev + 1);
      setTimeout(() => {
        setQuizQueue((prev) => {
          const next = isCorrect ? prev.slice(1) : [...prev.slice(1), prev[0]];
          if (next.length === 0) {
            crossfade(() => setSessionMode('finished'));
          } else {
            setCurrentQ(buildQuestion(next[0], wordsRef.current));
            setAnswered(null);
          }
          return next;
        });
      }, 1000);
    },
    [answered, currentQ, crossfade],
  );

  const list = getList(id ?? '');
  const reviewTotal = reviewTotalRef.current;
  const reviewDone = reviewTotal - reviewQueue.length;
  const reviewProgress = reviewTotal > 0 ? reviewDone / reviewTotal : 0;
  const quizTotal = quizTotalRef.current;
  const quizDone = correctCount + wrongCount;
  const quizProgress = quizTotal > 0 ? correctCount / quizTotal : 0;

  const cardRotate = cardPan.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!loading && reviewQueue.length === 0 && sessionMode === 'review' && reviewTotal === 0) {
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

  if (sessionMode === 'finished') {
    return (
      <Animated.View style={[styles.container, styles.center, { opacity: fadeAnim }]}>
        <Text style={styles.bigEmoji}>🎉</Text>
        <Text style={styles.centerTitle}>Tebrikler!</Text>
        <Text style={styles.centerDesc}>
          {list?.name ?? 'Liste'} listesindeki{'\n'}tüm kelimeleri öğrendin.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{quizTotal}</Text>
            <Text style={styles.statLbl}>Toplam</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#059669' }]}>{correctCount}</Text>
            <Text style={styles.statLbl}>Doğru</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#DC2626' }]}>{wrongCount}</Text>
            <Text style={styles.statLbl}>Yanlış</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Listeye Dön</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (sessionMode === 'quiz') {
    const q = currentQ;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color={c.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerMid}>
            <Text style={styles.headerTitle} numberOfLines={1}>{list?.name ?? 'Quiz'}</Text>
            <Text style={styles.modeLabel}>Quiz Modu</Text>
          </View>
          <Text style={styles.counter}>{quizDone} / {quizTotal}</Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: `${quizProgress * 100}%` }]} />
        </View>

        <Animated.View style={[styles.quizArea, { opacity: fadeAnim }]}>
          {q && (
            <>
              <View style={styles.quizWordCard}>
                <Text style={styles.quizWordLabel}>İngilizce</Text>
                <Text style={styles.quizWordText}>{q.word.word}</Text>
              </View>
              <Text style={styles.quizPrompt}>Türkçe anlamı nedir?</Text>
              <View style={styles.optionsCol}>
                {q.options.map((opt, idx) => {
                  let btnStyle: any = styles.optionBtn;
                  let txtStyle: any = styles.optionBtnText;
                  if (answered !== null) {
                    if (idx === q.correctIdx) {
                      btnStyle = { ...styles.optionBtn, ...styles.optionCorrect };
                      txtStyle = { ...styles.optionBtnText, color: '#059669' };
                    } else if (idx === answered && answered !== q.correctIdx) {
                      btnStyle = { ...styles.optionBtn, ...styles.optionWrong };
                      txtStyle = { ...styles.optionBtnText, color: '#DC2626' };
                    }
                  }
                  return (
                    <TouchableOpacity key={idx} style={btnStyle} onPress={() => handleAnswer(idx)} disabled={answered !== null} activeOpacity={0.82}>
                      <Text style={txtStyle}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </Animated.View>
      </View>
    );
  }

  const topWord = reviewQueue[0];
  const secondWord = reviewQueue[1];
  const thirdWord = reviewQueue[2];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={c.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle} numberOfLines={1}>{list?.name ?? 'Çalışma'}</Text>
          <Text style={styles.modeLabel}>Gözden Geçirme</Text>
        </View>
        <Text style={styles.counter}>{reviewDone} / {reviewTotal}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${reviewProgress * 100}%` }]} />
      </View>

      <Animated.View style={[styles.deckArea, { opacity: fadeAnim }]}>
        {thirdWord && (
          <View style={[styles.ghostCard, styles.ghostCard3]} pointerEvents="none">
            <View style={styles.ghostCardInner} />
          </View>
        )}
        {secondWord && (
          <View style={[styles.ghostCard, styles.ghostCard2]} pointerEvents="none">
            <View style={styles.ghostCardInner} />
          </View>
        )}
        {topWord && (
          <Animated.View
            style={[styles.topCardWrap, { transform: [{ translateX: cardPan.x }, { rotate: cardRotate }] }]}
            {...panResponder.panHandlers}
          >
            <FlashCard key={topWord.id} word={topWord} revealed={flipped} onFlip={() => setFlipped((f) => !f)} />
          </Animated.View>
        )}
      </Animated.View>

      <View style={styles.actionsArea}>
        <View style={styles.flipHintRow}>
          <Ionicons name="swap-horizontal-outline" size={14} color={c.textMuted} />
          <Text style={styles.flipHintText}>Kaydır veya</Text>
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={advanceReview} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>Sonraki</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
