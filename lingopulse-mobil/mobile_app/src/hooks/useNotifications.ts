import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const CHANNEL_ID = 'daily-review';
const IDENTIFIER = 'daily-review-reminder';

async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Günlük Tekrar',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
}

async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleDailyReminder(hour = 20, minute = 0) {
  await Notifications.cancelScheduledNotificationAsync(IDENTIFIER).catch(() => null);

  await Notifications.scheduleNotificationAsync({
    identifier: IDENTIFIER,
    content: {
      title: '🧠 Tekrar Zamanı!',
      body: 'Bugünkü kelime tekrarlarını yapmayı unutma.',
      sound: 'default',
      data: { screen: 'FlashCard' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(IDENTIFIER).catch(() => null);
}

export function useNotifications() {
  useEffect(() => {
    let active = true;
    (async () => {
      await setupAndroidChannel();
      const granted = await requestPermissions();
      if (granted && active) {
        await scheduleDailyReminder(20, 0);
      }
    })();
    return () => { active = false; };
  }, []);
}
