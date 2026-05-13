import { useState } from 'react';
import { useUkolyStore } from '../../store/ukolyStore.js';
import styles from './CategoryEditor.module.css';

export function CategoryEditor() {
  const categories = useUkolyStore((s) => s.categories);
  const subcategories = useUkolyStore((s) => s.subcategories);
  const renameCategory = useUkolyStore((s) => s.renameCategory);
  const addCategory = useUkolyStore((s) => s.addCategory);
  const deleteCategory = useUkolyStore((s) => s.deleteCategory);
  const addSubcategory = useUkolyStore((s) => s.addSubcategory);
  const deleteSubcategory = useUkolyStore((s) => s.deleteSubcategory);
  const renameSubcategory = useUkolyStore((s) => s.renameSubcategory);

  const [newCatName, setNewCatName] = useState('');
  const [newSubName, setNewSubName] = useState({}); // keyed by catIdx

  const onlyOne = categories.length <= 1;

  const tryDelete = (idx) => {
    const name = categories[idx];
    const taskCount = useUkolyStore.getState().tasks.filter((t) => t.cat === idx + 1).length;
    const subCount = (subcategories[idx] || []).length;
    if (!window.confirm(`Smazat kategorii „${name}"?\n\nSmaže se ${taskCount} úkolů a ${subCount} podkategorií.`)) return;
    deleteCategory(idx);
  };

  return (
    <>
      {categories.map((name, i) => (
        <div key={`c-${i}`}>
          <div className={styles.catRow}>
            <div className={styles.catNum}>{i + 1}</div>
            <input
              type="text"
              value={name}
              maxLength={40}
              aria-label={`Kategorie ${i + 1}`}
              onChange={(e) => renameCategory(i, e.target.value)}
            />
            <button
              type="button"
              className={styles.catDel}
              disabled={onlyOne}
              title={onlyOne ? 'Musí zůstat alespoň jedna kategorie.' : 'Smazat kategorii'}
              onClick={() => tryDelete(i)}
            >
              🗑
            </button>
          </div>
          <div className={styles.subcatEditor}>
            <div className={styles.subcatLabel}>Podkategorie ({(subcategories[i] || []).length})</div>
            {(subcategories[i] || []).map((sub) => (
              <div key={sub.id} className={styles.subcatEditRow}>
                <input
                  type="text"
                  defaultValue={sub.name}
                  maxLength={40}
                  aria-label={`Podkategorie ${sub.name}`}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (!v) { e.target.value = sub.name; return; }
                    renameSubcategory(i, sub.id, v);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                />
                <button
                  type="button"
                  className={styles.subDel}
                  title="Smazat podkategorii"
                  onClick={() => deleteSubcategory(i, sub.id)}
                >
                  🗑
                </button>
              </div>
            ))}
            <div className={styles.subcatEditRow}>
              <input
                type="text"
                placeholder="Nová podkategorie..."
                maxLength={40}
                value={newSubName[i] || ''}
                onChange={(e) => setNewSubName((p) => ({ ...p, [i]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (addSubcategory(i, newSubName[i])) {
                      setNewSubName((p) => ({ ...p, [i]: '' }));
                    }
                  }
                }}
                aria-label={`Nová podkategorie pro ${name}`}
              />
              <button
                type="button"
                className={styles.subAdd}
                onClick={() => {
                  if (addSubcategory(i, newSubName[i])) {
                    setNewSubName((p) => ({ ...p, [i]: '' }));
                  }
                }}
              >
                + Přidat
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className={styles.catAddRow}>
        <input
          type="text"
          placeholder="Nová kategorie..."
          maxLength={40}
          value={newCatName}
          aria-label="Nová kategorie"
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (addCategory(newCatName)) setNewCatName('');
            }
          }}
        />
        <button
          type="button"
          className={styles.add}
          onClick={() => {
            if (addCategory(newCatName)) setNewCatName('');
          }}
        >
          + Přidat kategorii
        </button>
      </div>
    </>
  );
}
