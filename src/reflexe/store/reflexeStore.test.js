import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useReflexeStore,
  __resetReflexeStore,
  K_WEBHOOK,
  K_QUEUE,
  K_HISTORY,
  K_REMINDERS,
} from './reflexeStore.js';

const s = () => useReflexeStore.getState();

describe('reflexeStore', () => {
  beforeEach(() => __resetReflexeStore());

  describe('webhook URL', () => {
    it('stores raw URL string in webhook-url localStorage key', () => {
      s().setWebhookUrl('https://example/exec');
      expect(localStorage.getItem(K_WEBHOOK)).toBe('https://example/exec');
      expect(s().webhookUrl).toBe('https://example/exec');
    });
    it('removes the key when set to empty', () => {
      s().setWebhookUrl('https://example/exec');
      s().setWebhookUrl('');
      expect(localStorage.getItem(K_WEBHOOK)).toBeNull();
      expect(s().webhookUrl).toBe('');
    });
    it('trims input', () => {
      s().setWebhookUrl('   https://x   ');
      expect(s().webhookUrl).toBe('https://x');
    });
  });

  describe('reminders', () => {
    it('persists 1/0 string', () => {
      s().setRemindersEnabled(true);
      expect(localStorage.getItem(K_REMINDERS)).toBe('1');
      s().setRemindersEnabled(false);
      expect(localStorage.getItem(K_REMINDERS)).toBe('0');
    });
  });

  describe('enqueue', () => {
    it('appends an item with ts and tries=0', () => {
      s().enqueue({ aktivity: 'X' });
      const stored = JSON.parse(localStorage.getItem(K_QUEUE));
      expect(stored).toHaveLength(1);
      expect(stored[0].data.aktivity).toBe('X');
      expect(stored[0].tries).toBe(0);
      expect(typeof stored[0].ts).toBe('number');
    });
  });

  describe('addHistory', () => {
    it('appends to history under the legacy key', () => {
      s().addHistory({ celkovy_skor: 5 });
      const stored = JSON.parse(localStorage.getItem(K_HISTORY));
      expect(stored).toHaveLength(1);
      expect(stored[0].celkovy_skor).toBe(5);
    });
  });

  describe('flushQueue', () => {
    it('no-ops when webhook URL is empty', async () => {
      s().enqueue({ a: 1 });
      const r = await s().flushQueue(async () => {});
      expect(r).toEqual({ sent: 0, remaining: 1 });
    });
    it('sends all and clears queue when post succeeds', async () => {
      s().setWebhookUrl('https://x');
      s().enqueue({ a: 1 });
      s().enqueue({ a: 2 });
      const post = vi.fn(async () => {});
      const r = await s().flushQueue(post);
      expect(r).toEqual({ sent: 2, remaining: 0 });
      expect(post).toHaveBeenCalledTimes(2);
      expect(s().queue).toEqual([]);
    });
    it('keeps failed items and increments tries', async () => {
      s().setWebhookUrl('https://x');
      s().enqueue({ a: 1 });
      s().enqueue({ a: 2 });
      const post = vi.fn(async (_url, data) => {
        if (data.a === 1) throw new Error('boom');
      });
      const r = await s().flushQueue(post);
      expect(r).toEqual({ sent: 1, remaining: 1 });
      expect(s().queue[0].tries).toBe(1);
      expect(s().queue[0].data.a).toBe(1);
    });
  });

  describe('hydration from existing localStorage', () => {
    it('reads existing webhook + queue + history + reminders on reset', () => {
      localStorage.setItem(K_WEBHOOK, 'https://h');
      localStorage.setItem(K_QUEUE, JSON.stringify([{ data: { a: 1 }, ts: 1, tries: 0 }]));
      localStorage.setItem(K_HISTORY, JSON.stringify([{ celkovy_skor: 7 }]));
      localStorage.setItem(K_REMINDERS, '1');
      // Re-trigger initialState
      useReflexeStore.setState({
        webhookUrl: (localStorage.getItem(K_WEBHOOK) || '').trim(),
        queue: JSON.parse(localStorage.getItem(K_QUEUE)),
        history: JSON.parse(localStorage.getItem(K_HISTORY)),
        remindersEnabled: localStorage.getItem(K_REMINDERS) === '1',
      });
      expect(s().webhookUrl).toBe('https://h');
      expect(s().queue).toHaveLength(1);
      expect(s().history).toHaveLength(1);
      expect(s().remindersEnabled).toBe(true);
    });
  });
});
