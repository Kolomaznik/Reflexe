# Auto-ukládání reflexí do Google Sheetu — návod

Po nastavení se každá reflexe **automaticky zapíše** do Google Sheetu, jakmile klikneš „Uložit reflexi". Už nic nemusíš vkládat do Claude chatu.

Nastavení zabere **5–10 minut a děláš ho jen jednou**.

---

## Krok 1 – Založ Google Sheet

1. Otevři [sheets.google.com](https://sheets.google.com) a klikni **+ Blank** (Nový prázdný sheet).
2. Pojmenuj ho nahoře vlevo: **Reflexe deník**.
3. List (sheet) dole nech být — skript si vytvoří list „Reflexe" sám.

Žádnou hlavičku ani data sem nepiš — Apps Script to udělá při prvním zápisu.

---

## Krok 2 – Otevři Apps Script

1. V otevřeném Sheetu v horním menu: **Rozšíření → Apps Script**.
2. Otevře se nová záložka s editorem kódu.
3. V levém panelu vidíš **Files → Code.gs** (s ukázkovou funkcí `myFunction()`).
4. Smaž **úplně všechen** výchozí kód v editoru.

---

## Krok 3 – Vlož kód webhooku

1. Otevři v počítači soubor **`apps-script.gs`** z této složky (ve Finderu / Průzkumníku) → otevři v libovolném textovém editoru.
2. Zkopíruj **celý obsah** (Ctrl+A, Ctrl+C).
3. Vlož do prázdného editoru Apps Script (Ctrl+V).
4. Nahoře pojmenuj projekt (klikni na „Untitled project"): **Reflexe webhook**.
5. Ulož (Ctrl+S nebo ikona diskety).

---

## Krok 4 – Deploy jako Web App

1. Vpravo nahoře klikni modré tlačítko **Deploy → New deployment**.
2. Vedle „Select type" klikni na **ikonu ozubeného kola ⚙** → vyber **Web app**.
3. Vyplň formulář:
   - **Description:** `Reflexe webhook v1`
   - **Execute as:** `Me (tvůj.email@gmail.com)`
   - **Who has access:** `Anyone` ← **musí být Anyone**, jinak appka nebude moct volat
4. Klikni **Deploy**.

### 4a – Autorizační dialog

Google tě provede permisemi:
1. **Authorize access** → vyber svůj Google účet.
2. Uvidíš varování **„Google hasn't verified this app"** — to je normální (je to tvůj soukromý skript).
3. Klikni dole **Advanced**.
4. Pak klikni odkaz dole: **Go to Reflexe webhook (unsafe)**.
5. Na další obrazovce odscroluj dolů → klikni **Allow**.

### 4b – Zkopíruj URL

Po deployi dostaneš dialog s:
- **Web app URL:** `https://script.google.com/macros/s/AKfycb.............../exec`

**Zkopíruj celou URL** (končí na `/exec`) a nech si ji na chvíli v clipboardu nebo si ji ulož někam do poznámek.

Dialog pak zavři.

---

## Krok 5 – Otestuj, že URL funguje

1. Vlož URL z kroku 4b do **webového prohlížeče** (např. nová záložka Chrome) a otevři.
2. Měl by se zobrazit text ve stylu:
   ```json
   {"status":"ok","message":"Reflexe webhook běží. POST JSON sem.","time":"2026-04-24T..."}
   ```
3. Pokud ano → webhook funguje ✅
4. Pokud vidíš chybu nebo „Authorization required" → znova projdi **krok 4a** (autorizaci).

---

## Krok 6 – Připoj URL do appky Reflexe

1. Otevři appku **Reflexe** na telefonu (případně [https://danielakolomaznikova.github.io/Reflexe/](https://danielakolomaznikova.github.io/Reflexe/) v prohlížeči).
2. Nahoře v oranžovém pruhu („Odpovídej rychle a poctivě…") klikni na **⚙ Nastavení automatického ukládání**.
3. Do pole **URL Google Apps Script** vlož URL z kroku 4b.
4. Klikni **Test odeslání**.
5. Měl by se objevit toast **„✓ Test OK — zkontroluj Google Sheet"**.
6. Otevři si Google Sheet v druhém okně — měl by se tam objevit řádek s `cas_bloku = TEST`.
7. Klikni **Uložit** (tlačítko v panelu Nastavení).

Hotovo. Od teď každá reflexe jde rovnou do Sheetu.

---

## Krok 7 – Ověř, že skutečná reflexe prochází

1. V appce vyplň jednu krátkou reflexi (třeba jen aktivity + slidery nech default).
2. Klikni **Uložit reflexi**.
3. V okně „Hotovo" by měl být zelený pruh **„✓ Uloženo do Google Sheetu"**.
4. V Sheetu zkontroluj nový řádek s reálnými daty.

---

## Co se stane když je offline

- Když v appce nefunguje internet, reflexe se uloží do **offline fronty** (v telefonu).
- Uvidíš žlutý status **„⚠ Offline nebo chyba webhook — zkusím později"**.
- Jakmile se appka příště otevře se spojením (nebo se obnoví internet), data se **automaticky odešlou**.
- Zároveň se JSON **zálohuje do schránky** — můžeš ho vložit do Claude chatu ručně, kdyby se něco pokazilo.

---

## Jak Claude synchronizuje Sheet → Excel + Word

Když budeš chtít, aby Claude zapsal data ze Sheetu do tvého `reflexe-denik.xlsx` a do Wordu reflexe, napiš mu v chatu třeba:

> „Synchronizuj nové reflexe ze Sheetu do Excelu a Wordu."

Claude si načte Sheet, přidá nové řádky do Excelu a vyplní odpovídající bloky ve Wordu dne — **pokud máš share na Sheetu nebo mi URL jen pošleš**. Přesný postup synchronizace nastavíme, až budeš mít Sheet rozběhnutý.

---

## Troubleshooting

| Problém | Řešení |
|---|---|
| Test odeslání: „Failed to fetch" | Zkontroluj, že URL končí na `/exec` a že při deployi bylo „Who has access: Anyone". |
| Test odeslání: „HTTP 401/403" | Autorizace není dokončená. V Apps Scriptu klikni ještě jednou Run na `doGet` a projdi Allow. |
| Sheet se neplní | Ověř v Apps Script: Executions (levý panel, ikona hodin) → uvidíš logy doPost a případné chyby. |
| Změnila jsem kód v Apps Scriptu | Musíš udělat **Deploy → Manage deployments → pero (edit) → Version: New → Deploy**. URL zůstane stejná. |
| Chci smazat webhook | V appce: ⚙ Nastavení → Smazat. V Apps Scriptu: Deploy → Manage deployments → Archive. |

---

## Bezpečnost

- URL webhooku je **tajná** — nikomu ji neposílej. Kdo má URL, může zapisovat do tvého Sheetu.
- Sheet samotný zůstává **soukromý** (jen ty ho vidíš v Google Drive).
- Apps Script běží **pod tvým účtem** (Execute as: Me), takže má přístup jen tam, kam ty.
- Kdyby někdy unikla URL, udělej nový deploy (Deploy → Manage → New deployment) a aktualizuj URL v appce.
