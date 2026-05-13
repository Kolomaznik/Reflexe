import { describe, it, expect } from 'vitest';
import { groupByCategory, groupBySubcategory } from './groupTasks.js';

describe('groupByCategory', () => {
  it('places tasks in their category buckets', () => {
    const tasks = [
      { id: 'a', cat: 1 },
      { id: 'b', cat: 3 },
      { id: 'c', cat: 1 },
    ];
    const g = groupByCategory(tasks, 6);
    expect(g[0].map((t) => t.id)).toEqual(['a', 'c']);
    expect(g[2].map((t) => t.id)).toEqual(['b']);
    expect(g[1]).toEqual([]);
  });
  it('ignores out-of-range cat', () => {
    const g = groupByCategory([{ id: 'a', cat: 99 }, { id: 'b', cat: 0 }], 3);
    expect(g.flat()).toEqual([]);
  });
});

describe('groupBySubcategory', () => {
  const subs = [{ id: 's1', name: 'X' }, { id: 's2', name: 'Y' }];
  it('groups tasks by their valid subcat id', () => {
    const tasks = [
      { id: 'a', subcat: 's1' },
      { id: 'b', subcat: 's2' },
      { id: 'c', subcat: null },
      { id: 'd', subcat: 's1' },
    ];
    const { noSub, bySubId } = groupBySubcategory(tasks, subs);
    expect(noSub.map((t) => t.id)).toEqual(['c']);
    expect(bySubId.get('s1').map((t) => t.id)).toEqual(['a', 'd']);
    expect(bySubId.get('s2').map((t) => t.id)).toEqual(['b']);
  });
  it('treats stale subcat ids as noSub (tolerant)', () => {
    const tasks = [{ id: 'a', subcat: 's999' }];
    const { noSub, bySubId } = groupBySubcategory(tasks, subs);
    expect(noSub.map((t) => t.id)).toEqual(['a']);
    expect(bySubId.get('s1')).toEqual([]);
    expect(bySubId.get('s2')).toEqual([]);
  });
  it('handles category with no subcategories', () => {
    const { noSub, bySubId } = groupBySubcategory([{ id: 'a', subcat: 's1' }], []);
    expect(noSub.map((t) => t.id)).toEqual(['a']);
    expect(bySubId.size).toBe(0);
  });
});
