import { describe, it, expect } from 'vitest';
import { computeBlockHour, formatBlockTime, formatLongDate, formatIsoDate } from './computeBlockTime.js';

describe('computeBlockHour', () => {
  it('rounds odd hours up to the next even', () => {
    expect(computeBlockHour(new Date('2026-05-13T09:30:00'))).toBe(10);
    expect(computeBlockHour(new Date('2026-05-13T11:00:00'))).toBe(12);
  });
  it('keeps even hours', () => {
    expect(computeBlockHour(new Date('2026-05-13T10:00:00'))).toBe(10);
    expect(computeBlockHour(new Date('2026-05-13T14:15:00'))).toBe(14);
  });
  it('clamps below 4 to 4', () => {
    expect(computeBlockHour(new Date('2026-05-13T02:00:00'))).toBe(4);
    expect(computeBlockHour(new Date('2026-05-13T03:30:00'))).toBe(4);
  });
  it('clamps above 22 to 22', () => {
    expect(computeBlockHour(new Date('2026-05-13T23:00:00'))).toBe(22);
  });
});

describe('formatBlockTime', () => {
  it('pads single-digit hours', () => {
    expect(formatBlockTime(new Date('2026-05-13T03:00:00'))).toBe('04:00');
    expect(formatBlockTime(new Date('2026-05-13T10:00:00'))).toBe('10:00');
  });
});

describe('formatLongDate', () => {
  it('formats date with Czech weekday and month', () => {
    const d = new Date(2026, 4, 13);
    const result = formatLongDate(d);
    expect(result).toContain('13.');
    expect(result).toContain('května');
    expect(result).toContain('2026');
  });
});

describe('formatIsoDate', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(formatIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(formatIsoDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});
