const DAYS = ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'];
const MONTHS = ['ledna', 'února', 'března', 'dubna', 'května', 'června', 'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];

const pad = (n) => String(n).padStart(2, '0');

export function computeBlockHour(date) {
  const h = date.getHours();
  let block = h;
  if (h % 2 !== 0) block = h + 1;
  if (block < 4) block = 4;
  if (block > 22) block = 22;
  return block;
}

export function formatBlockTime(date) {
  return pad(computeBlockHour(date)) + ':00';
}

export function formatLongDate(date) {
  return `${DAYS[date.getDay()]} · ${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
