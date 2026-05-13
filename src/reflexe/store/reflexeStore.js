import { create } from 'zustand';

export const K_WEBHOOK = 'webhook-url';
export const K_QUEUE = 'reflexe-queue';
export const K_HISTORY = 'reflexe-historie';
export const K_REMINDERS = 'reminders-enabled';

const readJson = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};
const writeJson = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function initialState() {
  return {
    webhookUrl: (localStorage.getItem(K_WEBHOOK) || '').trim(),
    queue: Array.isArray(readJson(K_QUEUE, [])) ? readJson(K_QUEUE, []) : [],
    history: Array.isArray(readJson(K_HISTORY, [])) ? readJson(K_HISTORY, []) : [],
    remindersEnabled: localStorage.getItem(K_REMINDERS) === '1',
  };
}

export const useReflexeStore = create((set, get) => ({
  ...initialState(),

  setWebhookUrl(v) {
    const trimmed = (v || '').trim();
    if (trimmed) localStorage.setItem(K_WEBHOOK, trimmed);
    else localStorage.removeItem(K_WEBHOOK);
    set({ webhookUrl: trimmed });
  },

  setRemindersEnabled(b) {
    localStorage.setItem(K_REMINDERS, b ? '1' : '0');
    set({ remindersEnabled: !!b });
  },

  enqueue(data) {
    const next = [...get().queue, { data, ts: Date.now(), tries: 0 }];
    writeJson(K_QUEUE, next);
    set({ queue: next });
  },

  addHistory(data) {
    const next = [...get().history, data];
    writeJson(K_HISTORY, next);
    set({ history: next });
  },

  /**
   * Try to send all queued items via `postFn(url, data)`. Items that fail
   * stay in the queue with incremented `tries`. Returns counts.
   */
  async flushQueue(postFn) {
    const url = get().webhookUrl;
    if (!url) return { sent: 0, remaining: get().queue.length };
    const q = get().queue;
    if (q.length === 0) return { sent: 0, remaining: 0 };
    let sent = 0;
    const remaining = [];
    for (const item of q) {
      try {
        await postFn(url, item.data);
        sent++;
      } catch {
        remaining.push({ ...item, tries: (item.tries || 0) + 1 });
      }
    }
    writeJson(K_QUEUE, remaining);
    set({ queue: remaining });
    return { sent, remaining: remaining.length };
  },
}));

export function __resetReflexeStore() {
  localStorage.removeItem(K_WEBHOOK);
  localStorage.removeItem(K_QUEUE);
  localStorage.removeItem(K_HISTORY);
  localStorage.removeItem(K_REMINDERS);
  useReflexeStore.setState(initialState());
}
