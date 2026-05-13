import { useState } from 'react';
import { useUkolyStore } from '../../store/ukolyStore.js';
import { buildWordHtml } from '../../lib/buildWordHtml.js';
import { buildPlainText } from '../../lib/buildPlainText.js';
import styles from './ExportActions.module.css';

export function ExportActions() {
  const categories = useUkolyStore((s) => s.categories);
  const subcategories = useUkolyStore((s) => s.subcategories);
  const tasks = useUkolyStore((s) => s.tasks);
  const clearTasks = useUkolyStore((s) => s.clearTasks);
  const [copyLabel, setCopyLabel] = useState('📋 Zkopírovat text');

  const downloadWord = () => {
    const html = buildWordHtml({ categories, subcategories, tasks });
    const blob = new Blob(['﻿', html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `ukoly-${stamp}.doc`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const copyText = async () => {
    const txt = buildPlainText({ categories, subcategories, tasks });
    try {
      await navigator.clipboard.writeText(txt);
      setCopyLabel('✅ Zkopírováno');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopyLabel('✅ Zkopírováno'); }
      catch (er) { alert('Nelze kopírovat, označ text ručně.'); }
      document.body.removeChild(ta);
    }
    setTimeout(() => setCopyLabel('📋 Zkopírovat text'), 1500);
  };

  const clearAll = () => {
    if (tasks.length === 0) return;
    if (!window.confirm(`Opravdu vymazat všechny úkoly (${tasks.length})? Kategorie zůstanou.`)) return;
    clearTasks();
  };

  return (
    <div className={styles.bar}>
      <button type="button" className={styles.gold} onClick={downloadWord}>📄 Stáhnout Word</button>
      <button type="button" className={styles.secondary} onClick={copyText}>{copyLabel}</button>
      <button type="button" className={styles.danger} onClick={clearAll}>🗑 Vymazat vše</button>
    </div>
  );
}
