import { formatIsoDate, formatBlockTime } from './computeBlockTime.js';

/**
 * Build the Reflexe payload from form values + the current date.
 * Form value shape: see ReflexeForm component.
 */
export function buildReflexePayload(form, now = new Date()) {
  const data = {
    datum: formatIsoDate(now),
    cas_bloku: formatBlockTime(now),
    typ: 'rychlá',
    aktivity: form.aktivity || '',
    pareto: {
      skore: +form.pareto_score,
      procent_cile: form.pareto_percent === '' || form.pareto_percent == null ? null : form.pareto_percent,
      poznamka: form.pareto_note || '',
    },
    parkinson: {
      skore: +form.parkinson_score,
      poznamka: form.parkinson_note || '',
    },
    zrouti: form.zrouti || '',
    posun_k_cilum: {
      skore: +form.posun_score,
      poznamka: form.posun_note || '',
    },
    mentalni_setup: {
      skore: +form.setup_score,
    },
    focus: {
      skore: +form.focus_score,
      poznamka: form.focus_note || '',
    },
    vedomost: {
      skore: +form.vedomost_score,
      procent_autopilot: form.vedomost_percent === '' || form.vedomost_percent == null ? null : form.vedomost_percent,
      poznamka: form.vedomost_note || '',
    },
    odolnost_vyruseni: {
      skore: +form.vyruseni_score,
      poznamka: form.vyruseni_note || '',
    },
  };
  const scores = [
    data.pareto.skore,
    data.parkinson.skore,
    data.posun_k_cilum.skore,
    data.mentalni_setup.skore,
    data.focus.skore,
    data.vedomost.skore,
    data.odolnost_vyruseni.skore,
  ];
  data.celkovy_skor = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  return data;
}
