export function coerceMins(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(99999, Math.floor(n));
}

export function formatMins(n) {
  const num = Number(n) || 0;
  if (num <= 0) return '—';
  if (num < 60) return num + ' min';
  const h = Math.floor(num / 60);
  const m = num % 60;
  return m === 0 ? h + ' h' : h + ' h ' + m + ' min';
}

export function sumMins(tasks) {
  return tasks.reduce((s, t) => s + (Number(t.mins) || 0), 0);
}
