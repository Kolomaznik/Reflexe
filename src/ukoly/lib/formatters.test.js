import { describe, it, expect } from 'vitest';
import { coerceMins, formatMins, sumMins } from './formatters.js';

describe('coerceMins', () => {
  it('returns 0 for non-numeric', () => {
    expect(coerceMins('abc')).toBe(0);
    expect(coerceMins(null)).toBe(0);
    expect(coerceMins(undefined)).toBe(0);
    expect(coerceMins(NaN)).toBe(0);
  });
  it('returns 0 for zero or negative', () => {
    expect(coerceMins(0)).toBe(0);
    expect(coerceMins(-5)).toBe(0);
  });
  it('floors floats and clamps at 99999', () => {
    expect(coerceMins(12.7)).toBe(12);
    expect(coerceMins(99999.9)).toBe(99999);
    expect(coerceMins(1000000)).toBe(99999);
  });
  it('coerces strings', () => {
    expect(coerceMins('30')).toBe(30);
    expect(coerceMins('15.4')).toBe(15);
  });
});

describe('formatMins', () => {
  it('returns em dash for <= 0', () => {
    expect(formatMins(0)).toBe('—');
    expect(formatMins(-5)).toBe('—');
    expect(formatMins(NaN)).toBe('—');
  });
  it('formats minutes under 60', () => {
    expect(formatMins(5)).toBe('5 min');
    expect(formatMins(59)).toBe('59 min');
  });
  it('formats whole hours', () => {
    expect(formatMins(60)).toBe('1 h');
    expect(formatMins(120)).toBe('2 h');
  });
  it('formats mixed hours and minutes', () => {
    expect(formatMins(75)).toBe('1 h 15 min');
    expect(formatMins(130)).toBe('2 h 10 min');
  });
});

describe('sumMins', () => {
  it('sums mins across tasks', () => {
    expect(sumMins([{ mins: 30 }, { mins: 15 }, { mins: 45 }])).toBe(90);
  });
  it('ignores non-numeric mins', () => {
    expect(sumMins([{ mins: 10 }, { mins: 'x' }, { mins: null }, {}])).toBe(10);
  });
  it('returns 0 for empty', () => {
    expect(sumMins([])).toBe(0);
  });
});
