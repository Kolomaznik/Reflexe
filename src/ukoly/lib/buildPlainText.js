import { formatMins, sumMins } from './formatters.js';
import { groupByCategory, groupBySubcategory } from './groupTasks.js';

export function buildPlainText({ categories, subcategories, tasks }) {
  const groups = groupByCategory(tasks, categories.length);
  let out = 'ÚKOLY PODLE KATEGORIÍ\n' + '='.repeat(40) + '\n\n';

  const writeTasks = (tasksArr, indent) => {
    tasksArr.forEach((t) => {
      const minsTxt = Number(t.mins) > 0 ? `  (${formatMins(t.mins)})` : '';
      out += `${indent}• ${t.text}${minsTxt}\n`;
    });
  };

  categories.forEach((name, i) => {
    const cTasks = groups[i];
    const subtotal = sumMins(cTasks);
    const head = cTasks.length === 0
      ? `${i + 1}. ${name.toUpperCase()} (0)`
      : `${i + 1}. ${name.toUpperCase()} (${cTasks.length} · ${formatMins(subtotal)})`;
    out += head + '\n';
    out += '-'.repeat(40) + '\n';
    if (cTasks.length === 0) {
      out += '  — žádné úkoly —\n';
    } else {
      const { noSub, bySubId } = groupBySubcategory(cTasks, subcategories[i] || []);
      writeTasks(noSub, '  ');
      (subcategories[i] || []).forEach((sub) => {
        const subTasks = bySubId.get(sub.id) || [];
        if (subTasks.length === 0) return;
        const subSum = sumMins(subTasks);
        out += `  ▸ ${sub.name} (${subTasks.length} · ${formatMins(subSum)})\n`;
        writeTasks(subTasks, '      ');
      });
    }
    out += '\n';
  });

  if (tasks.length > 0) {
    out += '='.repeat(40) + '\n';
    out += `CELKEM: ${tasks.length} úkolů · ${formatMins(sumMins(tasks))}\n`;
  }
  return out;
}
