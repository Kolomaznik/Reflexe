import styles from './TopNav.module.css';

const ITEMS = [
  { key: 'reflexe', href: '/index.html', icon: '📓', label: 'Reflexe' },
  { key: 'ukoly', href: '/ukoly.html', icon: '✓', label: 'Úkoly' },
];

export function TopNav({ active }) {
  return (
    <nav className={styles.bar} aria-label="Hlavní navigace">
      <div className={styles.inner}>
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <a
              key={item.key}
              href={item.href}
              className={`${styles.link} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.icon} aria-hidden="true">{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
