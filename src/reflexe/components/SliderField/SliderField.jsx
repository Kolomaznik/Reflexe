import styles from './SliderField.module.css';

function colorClass(v) {
  if (v <= 3) return styles.low;
  if (v <= 6) return styles.mid;
  return styles.high;
}

export function SliderField({ label, value, onChange, name }) {
  const v = Number(value) || 0;
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <div className={styles.wrap}>
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          name={name}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className={styles.ticks}>
          <span>1</span><span>3</span><span>5</span><span>7</span><span>10</span>
        </div>
      </div>
      <span className={`${styles.value} ${colorClass(v)}`} aria-live="polite">{value}</span>
    </div>
  );
}
