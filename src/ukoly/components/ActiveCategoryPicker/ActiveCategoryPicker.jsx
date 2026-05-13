import { useUkolyStore } from '../../store/ukolyStore.js';
import styles from './ActiveCategoryPicker.module.css';

export function ActiveCategoryPicker() {
  const categories = useUkolyStore((s) => s.categories);
  const activeCategory = useUkolyStore((s) => s.activeCategory);
  const setActiveCategory = useUkolyStore((s) => s.setActiveCategory);

  const subcategories = useUkolyStore((s) => s.subcategories);
  const activeSubcat = useUkolyStore((s) => s.activeSubcat);
  const setActiveSubcat = useUkolyStore((s) => s.setActiveSubcat);

  const activeSubs = subcategories[activeCategory - 1] || [];

  return (
    <>
      <div className={styles.list}>
        {categories.map((name, i) => {
          const num = i + 1;
          const isActive = activeCategory === num;
          return (
            <button
              key={num}
              type="button"
              className={`${styles.pick} ${isActive ? styles.active : ''}`}
              onClick={() => setActiveCategory(num)}
              aria-pressed={isActive}
            >
              <span className={styles.num}>{num}</span>
              {name}
            </button>
          );
        })}
      </div>
      {activeSubs.length > 0 && (
        <div className={styles.subList}>
          <button
            type="button"
            className={`${styles.subPick} ${styles.none} ${activeSubcat === null ? styles.active : ''}`}
            onClick={() => setActiveSubcat(null)}
            aria-pressed={activeSubcat === null}
          >
            — bez podkategorie
          </button>
          {activeSubs.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.subPick} ${activeSubcat === s.id ? styles.active : ''}`}
              onClick={() => setActiveSubcat(s.id)}
              aria-pressed={activeSubcat === s.id}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
