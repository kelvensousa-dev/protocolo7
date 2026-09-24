import type NotificationsType from 'expo-notifications';

// No Expo Go (SDK 53+) o próprio módulo nativo pode lançar ao ser carregado,
// já que notificações remotas não são mais suportadas nesse cliente.
// Por isso o require (não import estático) fica dentro do try: um import
// estático rodaria antes de qualquer try/catch nosso e derrubaria quem
// importar este arquivo (dados.tsx, index.tsx, pacto/ritual.tsx).
let Notifications: typeof NotificationsType | null = null;
try {
  Notifications = require('expo-notifications');
  Notifications!.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch {
  Notifications = null;
}

/** Um único lembrete por dia, com o critério da própria pessoa. Nada genérico. */
export async function agendarLembreteDiario(criterio: string, hora = 21) {
  if (!Notifications) return false;
  try {
    const { granted } = await Notifications.requestPermissionsAsync();
    if (!granted) return false;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Seu pacto de hoje', body: criterio },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hora, minute: 0 },
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelarLembretes() {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Nada para cancelar neste cliente.
  }
}
