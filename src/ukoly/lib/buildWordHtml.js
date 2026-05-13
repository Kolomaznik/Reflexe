import { escapeHtml } from '../../shared/lib/escapeHtml.js';
import { formatMins, sumMins } from './formatters.js';
import { groupByCategory, groupBySubcategory } from './groupTasks.js';

export function buildWordHtml({ categories, subcategories, tasks }) {
  const groups = groupByCategory(tasks, categories.length);
  const date = new Date().toLocaleDateString('cs-CZ');
  let body = `<h1 style="font-family:Calibri,Arial,sans-serif; color:#1F3A5F;">Úkoly podle kategorií</h1>`;
  body += `<p style="color:#6B6B6B; font-family:Calibri,Arial,sans-serif;">Vytvořeno ${escapeHtml(date)}</p>`;

  const renderTaskItems = (tasksArr) => {
    let out = `<ul style="font-family:Calibri,Arial,sans-serif; font-size:11pt;">`;
    tasksArr.forEach((t) => {
      const minsTxt = Number(t.mins) > 0
        ? ` <span style="color:#6B6B6B;">— ${escapeHtml(formatMins(t.mins))}</span>`
        : '';
      out += `<li>${escapeHtml(t.text)}${minsTxt}</li>`;
    });
    out += `</ul>`;
    return out;
  };

  categories.forEach((name, i) => {
    const cTasks = groups[i];
    const subtotal = sumMins(cTasks);
    const heading = cTasks.length === 0
      ? `${i + 1}. ${escapeHtml(name)} (0)`
      : `${i + 1}. ${escapeHtml(name)} (${cTasks.length} · ${escapeHtml(formatMins(subtotal))})`;
    body += `<h2 style="font-family:Calibri,Arial,sans-serif; color:#1F3A5F; border-bottom:1pt solid #C9A961; padding-bottom:3pt;">${heading}</h2>`;
    if (cTasks.length === 0) {
      body += `<p style="font-style:italic; color:#999; font-family:Calibri,Arial,sans-serif;">— žádné úkoly —</p>`;
    } else {
      const { noSub, bySubId } = groupBySubcategory(cTasks, subcategories[i] || []);
      if (noSub.length > 0) body += renderTaskItems(noSub);
      (subcategories[i] || []).forEach((sub) => {
        const subTasks = bySubId.get(sub.id) || [];
        if (subTasks.length === 0) return;
        const subSum = sumMins(subTasks);
        body += `<h3 style="font-family:Calibri,Arial,sans-serif; color:#1F3A5F; margin:8pt 0 4pt 12pt; font-size:12pt;">${escapeHtml(sub.name)} <span style="color:#6B6B6B; font-weight:normal; font-size:10pt;">(${subTasks.length} · ${escapeHtml(formatMins(subSum))})</span></h3>`;
        body += `<div style="margin-left:12pt;">${renderTaskItems(subTasks)}</div>`;
      });
    }
  });

  if (tasks.length > 0) {
    body += `<p style="font-family:Calibri,Arial,sans-serif; text-align:right; font-weight:bold; color:#1F3A5F; border-top:1pt solid #C9A961; padding-top:6pt;">Celkem: ${tasks.length} úkolů · ${escapeHtml(formatMins(sumMins(tasks)))}</p>`;
  }

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Úkoly podle kategorií</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  body { font-family: Calibri, Arial, sans-serif; }
  @page { margin: 2cm; }
</style>
</head>
<body>${body}</body>
</html>`;
}
