/**
 * Google Apps Script — doPost handler pro Reflexe PWA
 *
 * JAK NASTAVIT:
 * 1. Otevři https://sheets.google.com → Vytvoř nový Sheet → pojmenuj "Reflexe deník".
 * 2. V Sheetu: Rozšíření → Apps Script.
 * 3. Smaž výchozí kód, vlož celý tento soubor.
 * 4. Ulož (Ctrl+S) → pojmenuj projekt "Reflexe webhook".
 * 5. Deploy → New deployment → ikona ozubeného kola → Web app.
 *    - Description: "Reflexe webhook v1"
 *    - Execute as: Me (tvůj email)
 *    - Who has access: Anyone  ← důležité, jinak PWA nemůže volat
 * 6. Klikni Deploy → povolit oprávnění (bude tě tlačit přes dialog "unverified app",
 *    klikni Advanced → Go to project (unsafe) → Allow).
 * 7. Zkopíruj vygenerovanou "Web app URL" (končí na /exec) a vlož do appky (⚙ Nastavení).
 * 8. Otestuj tlačítkem „Test odeslání" — do Sheetu se přidá řádek s cas_bloku = TEST.
 *
 * POZNÁMKA: Pokud někdy uděláš změny v tomto kódu, musíš udělat Deploy → Manage
 * deployments → edit (pero) → New version → Deploy. URL zůstane stejná.
 */

// Název listu, do kterého se zapisuje. Když neexistuje, vytvoří se.
const SHEET_NAME = 'Reflexe';

// Hlavička — pořadí sloupců. Neměň bez úpravy mapRow().
const HEADER = [
  'datum', 'cas_bloku', 'typ', 'aktivity',
  'pareto_skore', 'pareto_procent_cile', 'pareto_poznamka',
  'parkinson_skore', 'parkinson_poznamka',
  'zrouti',
  'posun_skore', 'posun_poznamka',
  'setup_skore',
  'focus_skore', 'focus_poznamka',
  'vedomost_skore', 'vedomost_procent_autopilot', 'vedomost_poznamka',
  'vyruseni_skore', 'vyruseni_poznamka',
  'celkovy_skor',
  'zapsano_v'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    const row = mapRow(data);
    sheet.appendRow(row);
    return jsonResponse({ status: 'ok', row: sheet.getLastRow() });
  } catch (err) {
    return jsonResponse({ status: 'error', message: String(err) });
  }
}

// GET endpoint pro snadné ověření, že URL funguje (otevřeš v prohlížeči)
function doGet(e) {
  return jsonResponse({
    status: 'ok',
    message: 'Reflexe webhook běží. POST JSON sem.',
    time: new Date().toISOString()
  });
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER);
    // Formátování hlavičky
    const hdr = sheet.getRange(1, 1, 1, HEADER.length);
    hdr.setFontWeight('bold');
    hdr.setBackground('#1F3A5F');
    hdr.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function mapRow(d) {
  const get = (obj, key, def) => (obj && obj[key] !== undefined && obj[key] !== null) ? obj[key] : (def === undefined ? '' : def);
  return [
    get(d, 'datum'),
    get(d, 'cas_bloku'),
    get(d, 'typ'),
    get(d, 'aktivity'),
    get(d.pareto, 'skore'),
    get(d.pareto, 'procent_cile'),
    get(d.pareto, 'poznamka'),
    get(d.parkinson, 'skore'),
    get(d.parkinson, 'poznamka'),
    get(d, 'zrouti'),
    get(d.posun_k_cilum, 'skore'),
    get(d.posun_k_cilum, 'poznamka'),
    get(d.mentalni_setup, 'skore'),
    get(d.focus, 'skore'),
    get(d.focus, 'poznamka'),
    get(d.vedomost, 'skore'),
    get(d.vedomost, 'procent_autopilot'),
    get(d.vedomost, 'poznamka'),
    get(d.odolnost_vyruseni, 'skore'),
    get(d.odolnost_vyruseni, 'poznamka'),
    get(d, 'celkovy_skor'),
    new Date()
  ];
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
