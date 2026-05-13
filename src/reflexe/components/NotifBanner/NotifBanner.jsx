import { useEffect, useState } from 'react';
import { useReflexeStore } from '../../store/reflexeStore.js';
import { nextReminderTime } from '../../lib/nextReminderTime.js';
import styles from './NotifBanner.module.css';

function hasNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function NotifBanner({ onToast }) {
  const remindersEnabled = useReflexeStore((s) => s.remindersEnabled);
  const setRemindersEnabled = useReflexeStore((s) => s.setRemindersEnabled);
  const [perm, setPerm] = useState(() => (hasNotifications() ? Notification.permission : 'denied'));

  useEffect(() => {
    if (!hasNotifications()) return;
    if (!remindersEnabled || perm !== 'granted') return;
    const next = nextReminderTime(new Date());
    const ms = next.getTime() - Date.now();
    if (ms <= 0 || ms > 24 * 60 * 60 * 1000) return;
    const id = setTimeout(() => {
      try {
        new Notification('⏰ Čas na reflexi', {
          body: `Blok ${String(next.getHours()).padStart(2, '0')}:00 — 3 minuty.`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'reflexe-' + next.getHours(),
          requireInteraction: true,
        });
      } catch { /* ignore in jsdom */ }
    }, ms);
    return () => clearTimeout(id);
  }, [remindersEnabled, perm]);

  if (!hasNotifications()) return null;

  const toggle = async () => {
    if (remindersEnabled) {
      setRemindersEnabled(false);
      onToast('Připomínky vypnuté');
      return;
    }
    if (perm !== 'granted') {
      const result = await Notification.requestPermission();
      setPerm(result);
      if (result !== 'granted') {
        onToast('Notifikace nepovoleny');
        return;
      }
    }
    setRemindersEnabled(true);
    onToast('✓ Připomínky zapnuté');
    try {
      new Notification('Reflexe bloku', {
        body: 'Super, připomínky jsou aktivní. Uvidíme se v dalším bloku.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    } catch { /* ignore */ }
  };

  if (perm === 'denied') {
    return (
      <div className={styles.banner}>
        <span className={styles.status}>⚠ Notifikace zablokované v prohlížeči — povol je v nastavení</span>
      </div>
    );
  }

  const enabledNow = perm === 'granted' && remindersEnabled;

  return (
    <div className={styles.banner}>
      <span className={styles.status}>
        {enabledNow
          ? '🔔 Připomínky zapnuté (každé 2 h, 4:00–20:00)'
          : '🔔 Zapnout připomínky každé 2 hodiny?'}
      </span>
      <button
        type="button"
        className={`${styles.btn} ${enabledNow ? styles.secondary : styles.gold}`}
        onClick={toggle}
      >
        {enabledNow ? 'Vypnout' : 'Zapnout'}
      </button>
    </div>
  );
}
