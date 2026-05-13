import { useRef, useState } from 'react';
import { useUkolyStore } from '../../store/ukolyStore.js';
import { ocrLinesFromText } from '../../lib/ocrCleaner.js';
import styles from './OcrImport.module.css';

let workerSingleton = null;

async function loadTesseract() {
  const mod = await import('tesseract.js');
  return mod.default || mod;
}

export function OcrImport({ loadTesseract: loadFn = loadTesseract }) {
  const addTask = useUkolyStore((s) => s.addTask);
  const categories = useUkolyStore((s) => s.categories);
  const activeCategory = useUkolyStore((s) => s.activeCategory);
  const activeCatName = categories[activeCategory - 1] || '';

  const fileInputRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, text: '' });
  const [status, setStatus] = useState('');

  async function runOcr(files) {
    setRunning(true);
    setStatus('');
    try {
      const Tess = await loadFn();
      setProgress({ pct: 5, text: 'Stahuji jazyk (jen poprvé)...' });
      if (!workerSingleton) {
        workerSingleton = await Tess.createWorker(['ces', 'eng'], 1, {
          logger: (m) => {
            if (!m) return;
            if (m.status === 'recognizing text') {
              setProgress({ pct: (m.progress || 0) * 100, text: 'Rozpoznávám text... ' + Math.round((m.progress || 0) * 100) + '%' });
            } else if (m.status) {
              setProgress({ pct: (m.progress || 0) * 100, text: m.status });
            }
          },
        });
      }
      const collected = [];
      for (let i = 0; i < files.length; i++) {
        setProgress({ pct: 0, text: `Soubor ${i + 1}/${files.length}: ${files[i].name}` });
        const { data } = await workerSingleton.recognize(files[i]);
        collected.push(...ocrLinesFromText((data && data.text) || ''));
      }
      if (collected.length === 0) {
        setStatus('Na obrázku nebyl rozpoznán žádný text.');
      } else {
        collected.forEach((line) => addTask(line));
        setStatus(`✅ Přidáno ${collected.length} úkolů do kategorie „${activeCatName}".`);
      }
    } catch (err) {
      setStatus('❌ OCR chyba: ' + (err.message || String(err)));
    } finally {
      setRunning(false);
      setProgress({ pct: 0, text: '' });
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.btn}
        onClick={() => {
          if (running) return;
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
          }
        }}
        disabled={running}
      >
        {running ? '⏳ Zpracovávám...' : '📷 Načíst z fotky'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.fileInput}
        aria-label="OCR soubor"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) runOcr(files);
        }}
      />
      {(running || progress.text) && (
        <div className={styles.progressWrap}>
          <div className={styles.progressText}>{progress.text}</div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${Math.max(0, Math.min(100, progress.pct))}%` }} />
          </div>
        </div>
      )}
      {status && <div className={styles.status} role="status">{status}</div>}
    </>
  );
}

// Test-only reset of the worker singleton.
export function __resetOcrWorker() {
  workerSingleton = null;
}
