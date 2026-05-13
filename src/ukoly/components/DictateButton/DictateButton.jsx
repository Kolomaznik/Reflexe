import { useEffect, useRef, useState } from 'react';
import { useUkolyStore } from '../../store/ukolyStore.js';
import styles from './DictateButton.module.css';

const SpeechRecognition =
  typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export function DictateButton() {
  const addTask = useUkolyStore((s) => s.addTask);
  const categories = useUkolyStore((s) => s.categories);
  const activeCategory = useUkolyStore((s) => s.activeCategory);
  const [dictating, setDictating] = useState(false);
  const [status, setStatus] = useState('');
  const recRef = useRef(null);
  const activeRef = useRef({ dictating: false });

  const hasSR = !!SpeechRecognition;

  useEffect(() => () => {
    activeRef.current.dictating = false;
    if (recRef.current) {
      try { recRef.current.stop(); } catch (e) { /* ignore */ }
      recRef.current = null;
    }
  }, []);

  const activeCatName = categories[activeCategory - 1] || '';

  const start = () => {
    if (!hasSR) return;
    try {
      const rec = new SpeechRecognition();
      rec.lang = 'cs-CZ';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const txt = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            const cleaned = txt.trim();
            if (cleaned) addTask(cleaned);
          } else {
            interim += txt;
          }
        }
        setStatus(interim
          ? '…' + interim
          : `Poslouchám — nadiktuj úkol, pauza pro další (kategorie: ${activeCatName}).`);
      };
      rec.onerror = (ev) => {
        setStatus('Chyba mikrofonu: ' + (ev.error || 'neznámá'));
      };
      rec.onend = () => {
        if (activeRef.current.dictating) {
          try { rec.start(); } catch (e) { stop(); }
        }
      };
      rec.start();
      recRef.current = rec;
      activeRef.current.dictating = true;
      setDictating(true);
      setStatus(`Poslouchám — nadiktuj úkol, pauza pro další (kategorie: ${activeCatName}).`);
    } catch (e) {
      setStatus('Nelze spustit mikrofon: ' + e.message);
    }
  };

  const stop = () => {
    activeRef.current.dictating = false;
    setDictating(false);
    if (recRef.current) {
      try { recRef.current.stop(); } catch (e) { /* ignore */ }
      recRef.current = null;
    }
    setStatus('');
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.btn} ${dictating ? styles.active : ''}`}
        onClick={() => (dictating ? stop() : start())}
        disabled={!hasSR}
        aria-pressed={dictating}
      >
        {dictating ? '⏹ Zastavit diktování' : '🎤 Diktovat úkoly'}
      </button>
      <div className={styles.status} role="status">{status}</div>
    </>
  );
}

export function hasSpeechRecognition() {
  return !!SpeechRecognition;
}
