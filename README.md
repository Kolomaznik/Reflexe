# Reflexe bloku – PWA pro Android

Progressive Web App pro rychlou reflexi každého 2hodinového pracovního bloku. Nainstaluje se jako normální appka (ikona na ploše, funguje offline), po vyplnění ti zkopíruje JSON do schránky — vložíš ho do Claude chatu a on ti to zapíše do deníku.

## Co je v balíčku

```
android-app/
├── index.html              # Hlavní formulář (8 otázek) + webhook integrace
├── manifest.webmanifest    # PWA manifest (ikona, barvy, jméno)
├── sw.js                   # Service worker (offline + notifikace)
├── icon-192.png            # Ikona 192×192
├── icon-512.png            # Ikona 512×512
├── icon-maskable-512.png   # Maskable ikona (Android adaptive)
├── reflexe-kalendar.ics    # Záložní připomínky pro Google Kalendář
├── apps-script.gs          # Kód Google Apps Script (webhook → Sheet)
├── NAVOD-GOOGLE-SHEET.md   # Návod na auto-ukládání do Google Sheetu
└── README.md               # Tento soubor
```

## Auto-ukládání do Google Sheetu (doporučeno)

Po nastavení se každá reflexe **automaticky zapíše** do Google Sheetu bez ručního kopírování JSON do chatu. Návod: viz [NAVOD-GOOGLE-SHEET.md](NAVOD-GOOGLE-SHEET.md).

## Jak to rozchodit – 3 kroky

### 1. Nahraj soubory na GitHub Pages (nejrychlejší, zdarma)

1. Jdi na [github.com](https://github.com) a přihlas se (nebo si založ účet).
2. Klikni na **New repository** → název třeba `reflexe` → **Public** → **Create**.
3. Klikni **uploading an existing file** → přetáhni všechny soubory z této složky (kromě README, ale klidně i s ním).
4. Po uploadu klikni **Settings → Pages** (v levém menu).
5. U „Source" vyber **Deploy from a branch** → **main** → **/ (root)** → **Save**.
6. Po minutě se objeví URL ve tvaru `https://tvuj-username.github.io/reflexe/`. To je adresa tvé appky.

### 2. Nainstaluj si appku na telefon

1. Otevři v **Chrome na Androidu** URL z kroku 1.
2. Chrome ti nahoře nabídne: **„Přidat na plochu"** (nebo klikni na tři tečky → **Nainstalovat aplikaci**).
3. Appka se objeví mezi ostatními jako normální ikona. Otevírá se na celou obrazovku, bez adresního řádku.
4. **Při prvním otevření povol notifikace** (horní banner „Zapnout připomínky").

### 3. (Volitelné) Naimportuj .ics do Google Kalendáře jako zálohu

PWA notifikace jsou spolehlivé dokud je appka „živá" v systému. Pro 100% jistotu doporučuji i kalendářové události:

1. Otevři [calendar.google.com](https://calendar.google.com) na počítači.
2. Vlevo **ozubené kolo → Nastavení → Import & export → Importovat**.
3. Vyber soubor **reflexe-kalendar.ics** → zvol kalendář → **Import**.
4. Google Calendar appka na Androidu ti bude posílat notifikace automaticky.

**9 událostí** (4:00, 6:00, 8:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00) se opakuje po-pá.

## Jak se appka používá

1. **Připomínka zazvoní** v sudou hodinu (4–20 h).
2. Klikni na notifikaci → otevře se formulář s přednastaveným časem bloku.
3. Vyplň 8 otázek (slidery + textová pole) – trvá 3 min.
4. Klikni **Uložit reflexi**:
   - **S webhook nastavením:** data se odešlou do Google Sheetu → zelené ✓
   - **Bez webhooku (nebo offline):** JSON se zkopíruje do schránky → vložíš do Claude chatu
5. Claude pak synchronizuje data do Excelu a Wordu reflexe.

## Tipy

- **Appka funguje offline** – můžeš vyplnit i bez signálu, data zůstávají ve schránce.
- **Historie všech reflexí** se ukládá lokálně v `localStorage` (nemazej data Chrome pro tuto stránku).
- **Vypnout připomínky**: v appce klikni na banner → „Vypnout".
- **Nefunguje kopírování?** JSON je vidět ve formuláři, dá se označit prstem a zkopírovat ručně.

## Troubleshooting

| Problém | Řešení |
|---|---|
| Notifikace nechodí | Nastavení Android → Appky → Reflexe → Notifikace → povolit. Zkus kalendářové události jako zálohu. |
| „Přidat na plochu" nevidím | Musíš použít **Chrome** na Androidu (ne Samsung Internet ani Firefox). |
| Appka se neotevře offline | Zapni ji jednou s internetem – service worker si nacachuje potřebné soubory. |
| Ikona vypadá divně | Zkontroluj, že jsou na GitHub Pages všechny tři `icon-*.png` soubory. |

## Alternativní hostování

Kromě GitHub Pages fungují i:
- **Netlify Drop** ([app.netlify.com/drop](https://app.netlify.com/drop)) – jen přetáhneš složku, hotovo.
- **Vercel** – podobně jednoduché.
- **Vlastní doména** – nahraj přes FTP na jakýkoli HTTPS hosting.

PWA **vyžaduje HTTPS** (jinak nefunguje service worker = ani notifikace ani offline).
