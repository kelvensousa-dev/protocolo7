import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Um único lembrete por dia, com o critério da própria pessoa. Nada genérico. */
export async function agendarLembreteDiario(criterio: string, hora = 21) {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (!granted) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Seu pacto de hoje', body: criterio },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hora, minute: 0 },
  });
  return true;
}

export async function cancelarLembretes() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
