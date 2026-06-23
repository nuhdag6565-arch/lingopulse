import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIF_ID    = 'lp-podcast-player';
const CHANNEL_ID  = 'lp-player';
const CATEGORY_ID = 'lp-podcast-ctrl';

export const ACTION_PREV       = 'LP_PREV';
export const ACTION_PLAY_PAUSE = 'LP_PLAY_PAUSE';
export const ACTION_NEXT       = 'LP_NEXT';
export const ACTION_STOP       = 'LP_STOP';

// Uygulama ön plandayken bildirimi sessizce güncelle
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  false,
    shouldShowBanner: false,
    shouldShowList:   false,
    shouldPlaySound:  false,
    shouldSetBadge:   false,
  }),
});

export async function initPlayerNotification(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'LingoPulse — Kelime Oynatıcı',
      importance: Notifications.AndroidImportance.LOW,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: null,
      showBadge: false,
      vibrationPattern: [0],
    });
  }

  // İnteraktif bildirim butonları
  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    {
      identifier: ACTION_PREV,
      buttonTitle: '⏮  Önceki',
      options: { opensAppToForeground: false },
    },
    {
      identifier: ACTION_PLAY_PAUSE,
      buttonTitle: '⏸  Duraklat',
      options: { opensAppToForeground: false },
    },
    {
      identifier: ACTION_NEXT,
      buttonTitle: '⏭  Sonraki',
      options: { opensAppToForeground: false },
    },
    {
      identifier: ACTION_STOP,
      buttonTitle: '✕  Durdur',
      options: { opensAppToForeground: false, isDestructive: true },
    },
  ]);

  return true;
}

export interface PlayerNotifParams {
  listName: string;
  word: string;
  meaning: string;
  index: number;
  total: number;
  isPlaying: boolean;
}

export async function updatePlayerNotification(p: PlayerNotifParams): Promise<void> {
  const progress = `${p.index + 1} / ${p.total}`;

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_ID,
    content: {
      title: p.word,
      body: Platform.OS === 'ios'
        ? p.meaning
        : `${p.meaning}\n${p.listName}  ·  ${progress}`,
      ...(Platform.OS === 'ios' && {
        subtitle: `${p.listName}  ·  ${progress}`,
      }),
      categoryIdentifier: CATEGORY_ID,
      data: { action: 'playback' },
      sound: false,
    },
    trigger: null,
  });
}

export async function dismissPlayerNotification(): Promise<void> {
  await Notifications.dismissNotificationAsync(NOTIF_ID);
}
