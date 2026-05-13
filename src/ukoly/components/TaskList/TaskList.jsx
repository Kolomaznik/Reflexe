import { useUkolyStore } from '../../store/ukolyStore.js';
import { groupByCategory, groupBySubcategory } from '../../lib/groupTasks.js';
import { formatMins, sumMins } from '../../lib/formatters.js';
import styles from './TaskList.module.css';

function TaskRow({ task, subs }) {
  const moveTask = useUkolyStore((s) => s.moveTask);
  const moveTaskSubcat = useUkolyStore((s) => s.moveTaskSubcat);
  const deleteTask = useUkolyStore((s) => s.deleteTask);
  const updateTaskMins = useUkolyStore((s) => s.updateTaskMins);
  const categories = useUkolyStore((s) => s.categories);

  const minsVal = Number(task.mins) > 0 ? String(task.mins) : '';
  const subValid = subs.some((x) => x.id === task.subcat);

  return (
    <li className={styles.taskRow}>
      <span className={styles.taskText}>{task.text}</span>
      <input
        type="number"
        className={styles.taskMins}
        value={minsVal}
        min="0"
        max="999"
        step="5"
        placeholder="min"
        title="Odhad v minutách"
        aria-label={`Minuty pro ${task.text}`}
        onChange={(e) => updateTaskMins(task.id, e.target.value)}
      />
      <select
        className={styles.taskMove}
        value={task.cat}
        title="Přesunout do jiné kategorie"
        aria-label={`Kategorie pro ${task.text}`}
        onChange={(e) => moveTask(task.id, parseInt(e.target.value, 10))}
      >
        {categories.map((name, i) => (
          <option key={i} value={i + 1}>{i + 1}. {name}</option>
        ))}
      </select>
      {subs.length > 0 && (
        <select
          className={styles.taskMoveSub}
          value={subValid ? task.subcat : ''}
          title="Přesunout do jiné podkategorie"
          aria-label={`Podkategorie pro ${task.text}`}
          onChange={(e) => moveTaskSubcat(task.id, e.target.value === '' ? null : e.target.value)}
        >
          <option value="">— bez podkat.</option>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}
      <button
        type="button"
        className={styles.taskDel}
        title="Smazat úkol"
        aria-label={`Smazat ${task.text}`}
        onClick={() => deleteTask(task.id)}
      >
        🗑
      </button>
    </li>
  );
}

export function TaskList() {
  const categories = useUkolyStore((s) => s.categories);
  const subcategories = useUkolyStore((s) => s.subcategories);
  const tasks = useUkolyStore((s) => s.tasks);

  const groups = groupByCategory(tasks, categories.length);

  return (
    <>
      <div>
        {categories.map((name, i) => {
          const cTasks = groups[i];
          const subs = subcategories[i] || [];
          const subtotal = sumMins(cTasks);
          const badge = cTasks.length === 0
            ? '0'
            : `${cTasks.length} · ${formatMins(subtotal)}`;
          const isEmpty = cTasks.length === 0;

          let body;
          if (isEmpty) {
            body = <ul className={styles.list}><li className={styles.empty}>(žádné úkoly)</li></ul>;
          } else {
            const { noSub, bySubId } = groupBySubcategory(cTasks, subs);
            body = (
              <>
                {noSub.length > 0 && (
                  <ul className={styles.list}>
                    {noSub.map((t) => <TaskRow key={t.id} task={t} subs={subs} />)}
                  </ul>
                )}
                {subs.map((sub) => {
                  const subTasks = bySubId.get(sub.id) || [];
                  if (subTasks.length === 0) return null;
                  return (
                    <div key={sub.id} className={styles.summarySubcat}>
                      <h4>
                        {sub.name}
                        <span className={styles.badgeSm}>{subTasks.length} · {formatMins(sumMins(subTasks))}</span>
                      </h4>
                      <ul className={styles.list}>
                        {subTasks.map((t) => <TaskRow key={t.id} task={t} subs={subs} />)}
                      </ul>
                    </div>
                  );
                })}
              </>
            );
          }

          return (
            <div key={i} className={styles.summaryCat}>
              <h3>
                {i + 1}. {name}
                <span className={styles.badge}>{badge}</span>
              </h3>
              {body}
            </div>
          );
        })}
      </div>
      {tasks.length > 0 && (
        <div className={styles.grandTotal}>
          Celkem: {tasks.length} úkolů · {formatMins(sumMins(tasks))}
        </div>
      )}
    </>
  );
}
