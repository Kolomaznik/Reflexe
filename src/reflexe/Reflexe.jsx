import { useEffect, useState } from 'react';
import styles from './Reflexe.module.css';
import { TopNav } from '../shared/components/TopNav/TopNav.jsx';
import { NotifBanner } from './components/NotifBanner/NotifBanner.jsx';
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel.jsx';
import { ReflexeForm } from './components/ReflexeForm/ReflexeForm.jsx';
import { ResultPanel, useSubmitReflection } from './components/ResultPanel/ResultPanel.jsx';
import { buildReflexePayload } from './lib/buildReflexePayload.js';
import { formatBlockTime, formatLongDate } from './lib/computeBlockTime.js';
import { useReflexeStore } from './store/reflexeStore.js';
import { postWebhook } from './lib/postWebhook.js';

function useToast() {
  const [toast, setToast] = useState({ text: '', show: false });
  const showToast = (text) => {
    setToast({ text, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  };
  return { toast, showToast };
}

export function Reflexe() {
  const now = new Date();
  const blockTime = formatBlockTime(now);
  const longDate = formatLongDate(now);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast, showToast } = useToast();
  const { state: submitState, submit, retry, reset } = useSubmitReflection();
  const flushQueue = useReflexeStore((s) => s.flushQueue);

  useEffect(() => {
    flushQueue(postWebhook).catch(() => {});
    const onOnline = () => flushQueue(postWebhook).catch(() => {});
    const onVisible = () => {
      if (!document.hidden) flushQueue(postWebhook).catch(() => {});
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [flushQueue]);

  return (
    <>
      <TopNav active="reflexe" />
      <div className={styles.container}>
      <header className={styles.header}>
        <h1>DENÍK REFLEXE</h1>
        <div className={styles.subtitle}>Reflexe bloku <span>{blockTime}</span></div>
        <div className={styles.meta}><span>{longDate}</span> · trvání cca 3 minuty</div>
      </header>

      {submitState.status === 'idle' && <NotifBanner onToast={showToast} />}

      <div className={styles.hint}>
        Odpovídej rychle a poctivě. Škály: <strong>1 = slabé, 10 = mistrovské</strong>.
        <br />
        <button type="button" className={styles.settingsLink} onClick={() => setSettingsOpen((o) => !o)}>
          ⚙ Nastavení automatického ukládání
        </button>
      </div>

      {settingsOpen && <SettingsPanel onToast={showToast} />}

      {submitState.status === 'idle' ? (
        <ReflexeForm onSubmit={(form) => submit(buildReflexePayload(form, new Date()), { onToast: showToast })} />
      ) : (
        <ResultPanel
          json={submitState.json}
          status={submitState.status}
          message={submitState.message}
          hint={submitState.hint}
          onRetry={() => retry()}
          onNew={() => { reset(); }}
          onToast={showToast}
        />
      )}

      <div className={`${styles.toast} ${toast.show ? styles.show : ''}`} role="alert" aria-live="polite">
        {toast.text}
      </div>
      </div>
    </>
  );
}
