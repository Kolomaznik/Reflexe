import { useUkolyStore, QUICK_MINS } from '../../store/ukolyStore.js';
import styles from './DefaultMinsPicker.module.css';

export function DefaultMinsPicker() {
  const defaultMins = useUkolyStore((s) => s.defaultMins);
  const setDefaultMins = useUkolyStore((s) => s.setDefaultMins);

  return (
    <>
      <label className={styles.fieldLabel}>Odhadovaný čas (pro nově přidané úkoly)</label>
      <div className={styles.row}>
        <div className={styles.pickList}>
          {QUICK_MINS.map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.pick} ${defaultMins === n ? styles.active : ''}`}
              aria-pressed={defaultMins === n}
              onClick={() => setDefaultMins(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <input
          type="number"
          min="0"
          max="999"
          step="5"
          placeholder="min"
          className={styles.customInput}
          value={defaultMins || ''}
          onChange={(e) => setDefaultMins(e.target.value)}
          aria-label="Vlastní čas v minutách"
        />
        <span className={styles.unit}>min</span>
      </div>
    </>
  );
}
