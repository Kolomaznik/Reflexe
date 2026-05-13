export function groupByCategory(tasks, categoryCount) {
  const groups = Array.from({ length: categoryCount }, () => []);
  tasks.forEach((t) => {
    if (Number.isInteger(t.cat) && t.cat >= 1 && t.cat <= categoryCount) {
      groups[t.cat - 1].push(t);
    }
  });
  return groups;
}

export function groupBySubcategory(tasks, subcategoriesForCat) {
  const subs = subcategoriesForCat || [];
  const validIds = new Set(subs.map((s) => s.id));
  const noSub = [];
  const bySubId = new Map();
  subs.forEach((s) => bySubId.set(s.id, []));
  tasks.forEach((t) => {
    if (t.subcat && validIds.has(t.subcat)) {
      bySubId.get(t.subcat).push(t);
    } else {
      noSub.push(t);
    }
  });
  return { noSub, bySubId };
}
