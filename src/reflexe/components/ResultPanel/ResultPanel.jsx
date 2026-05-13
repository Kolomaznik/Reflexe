import { useState } from 'react';
import { useReflexeStore } from '../../store/reflexeStore.js';
import { postWebhook } from '../../lib/postWebhook.js';
import styles from './ResultPanel.module.css';

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (e) {
      reject(e);
    } finally {
      document.body.removeChild(ta);
    }
  });
}

/**
 * status: 'sending' | 'ok' | 'offline' | 'info'
 */
export function ResultPanel({ json, status, message, hint, onRetry, onNew, onToast }) {
  return (
    <div className={styles.result}>
      <h2>✓ Hotovo</h2>
      <div className={`${styles.statusBox} ${styles[status] || styles.info}`} role="status">{message}</div>
      <p dangerouslySetInnerHTML={{ __html: hint || '' }} />
      <div className={styles.actions}>
        {onRetry && status === 'offline' && (
          <button type="button" className={styles.gold} onClick={onRetry}>Zkusit znovu odeslat</button>
        )}
        <button
          type="button"
          className={styles.gold}
          onClick={async () => {
            try { await copyText(json); onToast?.('✓ Zkopírováno do schránky'); }
            catch (e) { onToast?.('⚠ Zkopíruj ručně'); }
          }}
        >Kopírovat JSON</button>
        <button type="button" className={styles.secondary} onClick={onNew}>Nová reflexe</button>
      </div>
      <pre>{json}</pre>
    </div>
  );
}

/**
 * Higher-level controller that wires the submit + retry flow against the store.
 */
export function useSubmitReflection() {
  const [state, setState] = useState({ status: 'idle', message: '', hint: '', json: '' });
  const enqueue = useReflexeStore((s) => s.enqueue);
  const addHistory = useReflexeStore((s) => s.addHistory);
  const flushQueue = useReflexeStore((s) => s.flushQueue);
  const webhookUrl = useReflexeStore((s) => s.webhookUrl);

  async function submit(payload, { post = postWebhook, onToast } = {}) {
    addHistory(payload);
    const json = JSON.stringify(payload, null, 2);
    if (!webhookUrl) {
      setState({ status: 'info', message: '📋 Zkopírováno do schránky',
        hint: 'Webhook není nastaven — JSON máš <strong>ve schránce</strong>. Vlož ho do Claude chatu.',
        json });
      try { await navigator.clipboard.writeText(json); } catch { /* ignore */ }
      return;
    }
    setState({ status: 'sending', message: '⏳ Odesílám do Google Sheetu…', hint: '', json });
    try {
      await post(webhookUrl, payload);
      setState({ status: 'ok', message: '✓ Uloženo do Google Sheetu',
        hint: 'Reflexe je zapsaná. Claude ji pak synchronizuje do Excelu i Wordu reflexe.',
        json });
      await flushQueue(post);
    } catch (e) {
      enqueue(payload);
      setState({ status: 'offline', message: '⚠ Offline nebo chyba webhook — zkusím později',
        hint: `Reflexe je v <strong>offline frontě</strong> a odešle se automaticky, až bude spojení.<br><small>(${e.message || e})</small>`,
        json });
      try { await navigator.clipboard.writeText(json); } catch { /* ignore */ }
    }
  }

  async function retry({ post = postWebhook } = {}) {
    setState((p) => ({ ...p, status: 'sending', message: '⏳ Zkouším odeslat frontu…' }));
    const r = await flushQueue(post);
    if (r.remaining === 0 && r.sent > 0) {
      setState((p) => ({ ...p, status: 'ok', message: `✓ Odesláno ${r.sent} reflexí`, hint: '' }));
    } else {
      setState((p) => ({ ...p, status: 'offline', message: `⚠ Čeká ${r.remaining} reflexí`,
        hint: 'Zkusím znovu, až bude spojení.' }));
    }
  }

  function reset() { setState({ status: 'idle', message: '', hint: '', json: '' }); }

  return { state, submit, retry, reset };
}
