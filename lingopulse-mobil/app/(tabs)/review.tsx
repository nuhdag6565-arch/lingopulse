import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useWords, type Word } from '@/src/context/WordContext';
import { FlashCard } from '@/src/components/FlashCard';
import { EmptyState } from '@/src/components/EmptyState';
import { AppColors } from '@/src/constants/colors';

export default function ReviewScreen() {
  const { loadAllWords } = useWords();

  // currentWord = kart üzerinde gösterilen kelime
  // queue = sıradaki kelimeler (currentWord dahil değil)
  const allRef = useRef<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [queue, setQueue] = useState<Word[]>([]);

  const [flipped, setFlipped] = useState(false);    // kartın görsel durumu
  const [revealed, setRevealed] = useState(false);  // "Bilmiyorum" basıldı mı (Devam Et göster)
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadAllWords().then((words) => {
        if (!active) return;
        allRef.current = words;
        setCurrentWord(words[0] ?? null);
        setQueue(words.slice(1));
        setFlipped(false);
        setRevealed(false);
        setLoading(false);
      });
      return () => { active = false; };
    }, [loadAllWords]),
  );

  // Fade-out → state değiştir → fade-in
  const nextCard = useCallback(
    (next: Word | null, rest: Word[]) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setCurrentWord(next);
        setQueue(rest);
        setFlipped(false);
        setRevealed(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  // Biliyorum → sıradaki kelimeye geç; liste bittiyse baştan başla
  const handleKnew = useCallback(() => {
    if (queue.length === 0) {
      const all = allRef.current;
      nextCard(all[0] ?? null, all.slice(1));
    } else {
      nextCard(queue[0], queue.slice(1));
    }
  }, [queue, nextCard]);

  // Bilmiyorum → Türkçeyi göster, kelimeyi kuyruğun sonuna at
  const handleDidNotKnow = useCallback(() => {
    if (!currentWord) return;
    setQueue((prev) => [...prev, currentWord]);
    setFlipped(true);
    setRevealed(true);
  }, [currentWord]);

  // Devam Et → Bilmiyorum sonrası sıradaki kelimeye geç
  const handleContinue = useCallback(() => {
    // queue'nun başı sıradaki kelime; currentWord zaten sona atıldı
    nextCard(queue[0] ?? null, queue.slice(1));
  }, [queue, nextCard]);

  // Karta dokunma → görsel çevirme (queue'ya dokunmaz)
  const handleTapCard = useCallback(() => {
    setFlipped((f) => !f);
  }, []);

  // ─── Yükleniyor ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  // ─── Kelime yok ──────────────────────────────────────────────────────────
  if (!currentWord) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📚"
          title="Kelime bulunamadı"
          description="Önce bir listeye kelime ekle, sonra tekrar sekmesine geri dön."
        />
      </View>
    );
  }

  const total = allRef.current.length;
  const remaining = queue.length + 1; // current + sıradakiler

  return (
    <View style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tekrar</Text>
        <Text style={styles.counter}>{remaining} / {total}</Text>
      </View>

      {/* İlerleme çubuğu */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((total - remaining) / Math.max(total, 1)) * 100}%` },
          ]}
        />
      </View>

      {/* Kart — dokunulabilir */}
      <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={handleTapCard}
          activeOpacity={0.97}
          style={styles.cardTouch}
        >
          <FlashCard key={currentWord.id} word={currentWord} revealed={flipped} />
        </TouchableOpacity>
      </Animated.View>

      {/* Butonlar */}
      <View style={styles.buttonsWrapper}>
        {revealed ? (
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Devam Et →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.noBtn]}
              onPress={handleDidNotKnow}
              activeOpacity={0.85}
            >
              <Text style={styles.noText}>✗  Bilmiyorum</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.yesBtn]}
              onPress={handleKnew}
              activeOpacity={0.85}
            >
              <Text style={styles.yesText}>✓  Biliyorum</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.textPrimary,
  },
  counter: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: AppColors.border,
    borderRadius: 3,
    marginBottom: 28,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 3,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTouch: {
    width: '100%',
  },
  buttonsWrapper: {
    paddingBottom: 32,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  noBtn: {
    backgroundColor: '#FEE2E2',
  },
  yesBtn: {
    backgroundColor: '#D1FAE5',
  },
  noText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  yesText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  continueBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
