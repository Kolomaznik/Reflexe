import { describe, it, expect } from 'vitest';
import { buildReflexePayload } from './buildReflexePayload.js';

const sampleForm = {
  aktivity: 'Psaní kódu',
  pareto_score: '8',
  pareto_percent: '70',
  pareto_note: 'Šlo to',
  parkinson_score: '7',
  parkinson_note: '',
  zrouti: 'IG',
  posun_score: '6',
  posun_note: '',
  setup_score: '9',
  focus_score: '8',
  focus_note: '',
  vedomost_score: '7',
  vedomost_percent: '20',
  vedomost_note: '',
  vyruseni_score: '6',
  vyruseni_note: 'Telefon',
};

describe('buildReflexePayload', () => {
  it('maps form fields onto the JSON shape', () => {
    const now = new Date(2026, 4, 13, 10, 0); // 10:00 → block 10:00
    const out = buildReflexePayload(sampleForm, now);
    expect(out.datum).toBe('2026-05-13');
    expect(out.cas_bloku).toBe('10:00');
    expect(out.typ).toBe('rychlá');
    expect(out.aktivity).toBe('Psaní kódu');
    expect(out.pareto).toEqual({ skore: 8, procent_cile: '70', poznamka: 'Šlo to' });
    expect(out.parkinson).toEqual({ skore: 7, poznamka: '' });
    expect(out.vedomost.procent_autopilot).toBe('20');
  });

  it('computes celkovy_skor as the mean across 7 sliders', () => {
    const form = {
      pareto_score: '10', parkinson_score: '10', posun_score: '10',
      setup_score: '10', focus_score: '10', vedomost_score: '10', vyruseni_score: '10',
    };
    expect(buildReflexePayload(form, new Date(2026, 0, 1, 10, 0)).celkovy_skor).toBe(10);
    const mixed = { ...form, pareto_score: '4', vyruseni_score: '6' };
    // (4+10+10+10+10+10+6)/7 = 60/7 ≈ 8.571 → 8.6
    expect(buildReflexePayload(mixed, new Date(2026, 0, 1, 10, 0)).celkovy_skor).toBe(8.6);
  });

  it('converts empty percent strings to null', () => {
    const form = {
      ...sampleForm,
      pareto_percent: '',
      vedomost_percent: '',
    };
    const out = buildReflexePayload(form, new Date(2026, 0, 1, 10, 0));
    expect(out.pareto.procent_cile).toBeNull();
    expect(out.vedomost.procent_autopilot).toBeNull();
  });
});
