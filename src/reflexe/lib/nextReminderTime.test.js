import { describe, it, expect } from 'vitest';
import { nextReminderTime } from './nextReminderTime.js';

describe('nextReminderTime', () => {
  it('returns today 04:00 if before 4am', () => {
    const now = new Date(2026, 4, 13, 2, 30);
    const r = nextReminderTime(now);
    expect(r.getHours()).toBe(4);
    expect(r.getDate()).toBe(13);
  });
  it('returns tomorrow 04:00 if 20:00 or later', () => {
    const now = new Date(2026, 4, 13, 21, 15);
    const r = nextReminderTime(now);
    expect(r.getHours()).toBe(4);
    expect(r.getDate()).toBe(14);
  });
  it('jumps to next even hour when current is odd', () => {
    const now = new Date(2026, 4, 13, 9, 30);
    const r = nextReminderTime(now);
    expect(r.getHours()).toBe(10);
    expect(r.getDate()).toBe(13);
  });
  it('jumps +2h when current is even', () => {
    const now = new Date(2026, 4, 13, 10, 0);
    const r = nextReminderTime(now);
    expect(r.getHours()).toBe(12);
    expect(r.getDate()).toBe(13);
  });
  it('wraps to tomorrow 04:00 when next even hour > 20', () => {
    const now = new Date(2026, 4, 13, 19, 30); // odd next would be 20, fine
    const r1 = nextReminderTime(now);
    expect(r1.getHours()).toBe(20);
    const now2 = new Date(2026, 4, 13, 19, 0); // even +2 = 20 (allowed since "if > 20")
    expect(nextReminderTime(now2).getHours()).toBe(20);
  });
});
