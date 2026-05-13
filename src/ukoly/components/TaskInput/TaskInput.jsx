import { useState } from 'react';
import { useUkolyStore } from '../../store/ukolyStore.js';
import styles from './TaskInput.module.css';

export function TaskInput() {
  const addTask = useUkolyStore((s) => s.addTask);
  const [value, setValue] = useState('');

  const submit = () => {
    if (addTask(value)) setValue('');
  };

  return (
    <div className={styles.row}>
      <input
        type="text"
        className={styles.input}
        placeholder="Napiš úkol a stiskni Přidat"
        value={value}
        aria-label="Nový úkol"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button type="button" className={styles.addBtn} onClick={submit}>
        ➕ Přidat
      </button>
    </div>
  );
}
