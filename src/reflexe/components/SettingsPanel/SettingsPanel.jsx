import { useState } from 'react';
import { useReflexeStore } from '../../store/reflexeStore.js';
import { postWebhook } from '../../lib/postWebhook.js';
import styles from './SettingsPanel.module.css';

export function SettingsPanel({ onToast, post = postWebhook }) {
  const webhookUrl = useReflexeStore((s) => s.webhookUrl);
  const queue = useReflexeStore((s) => s.queue);
  const setWebhookUrl = useReflexeStore((s) => s.setWebhookUrl);

  const [value, setValue] = useState(webhookUrl);

  const save = () => {
    const v = value.trim();
    if (v && !/^https:\/\/script\.google\.com\//.test(v)) {
      if (!window.confirm('URL nevypadá jako Google Apps Script. Přesto uložit?')) return;
    }
    setWebhookUrl(v);
    onToast(v ? '✓ Webhook uložen' : '✓ Webhook smazán');
  };

  const clear = () => {
    setWebhookUrl('');
    setValue('');
    onToast('✓ Webhook smazán');
  };

  const test = async () => {
    const v = value.trim();
    if (!v) { onToast('⚠ Vyplň URL'); return; }
    setWebhookUrl(v);
    onToast('⏳ Testuji…');
    try {
      await post(v, {
        datum: new Date().toISOString().slice(0, 10),
        cas_bloku: 'TEST',
        typ: 'test',
        aktivity: 'Test odeslání z appky',
        celkovy_skor: 0,
        _test: true,
      });
      onToast('✓ Test OK — zkontroluj Google Sheet');
    } catch (e) {
      onToast('✗ Chyba: ' + String(e.message || e).slice(0, 80));
    }
  };

  const info = (() => {
    const parts = [];
    if (webhookUrl) parts.push('✓ Webhook nastaven');
    else parts.push('⚠ Webhook není nastaven — ukládá se jen do schránky');
    if (queue.length > 0) parts.push(`📦 Čeká v queue: ${queue.length} reflexí`);
    return parts.join(' · ');
  })();

  return (
    <div className={styles.panel} role="region" aria-label="Nastavení">
      <label htmlFor="webhook-url-input">URL Google Apps Script (webhook)</label>
      <input
        id="webhook-url-input"
        type="url"
        placeholder="https://script.google.com/macros/s/…/exec"
        autoComplete="off"
        spellCheck="false"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className={styles.help}>
        Vlož URL z Apps Scriptu (po „Deploy → Web App"). Reflexe se po uložení odešle přímo do tvého Google Sheetu.
        Když není vyplněno, data se jen zkopírují do schránky jako dříve.
      </div>
      <div className={styles.btnRow}>
        <button type="button" className={styles.gold} onClick={save}>Uložit</button>
        <button type="button" className={styles.secondary} onClick={test}>Test odeslání</button>
        <button type="button" className={styles.secondary} onClick={clear}>Smazat</button>
      </div>
      <div className={styles.info}>{info}</div>
    </div>
  );
}
