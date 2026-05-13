/**
 * Returns the Date of the next even-hour reminder within 04:00–20:00.
 * - If current hour < 4: next is today at 04:00.
 * - If current hour >= 20: next is tomorrow at 04:00.
 * - Otherwise: next is the next even hour up to 20:00 (else tomorrow 04:00).
 */
export function nextReminderTime(now) {
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  const h = now.getHours();
  let targetH;
  if (h < 4) {
    targetH = 4;
  } else if (h >= 20) {
    next.setDate(next.getDate() + 1);
    targetH = 4;
  } else {
    targetH = h % 2 === 0 ? h + 2 : h + 1;
    if (targetH > 20) {
      next.setDate(next.getDate() + 1);
      targetH = 4;
    }
  }
  next.setHours(targetH);
  return next;
}
