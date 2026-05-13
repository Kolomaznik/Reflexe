import { describe, it, expect } from 'vitest';
import { buildWordHtml } from './buildWordHtml.js';

const baseState = {
  categories: ['Práce', 'Osobní'],
  subcategories: [
    [{ id: 's1', name: 'Schůzky' }, { id: 's2', name: 'Emaily' }],
    [],
  ],
  tasks: [
    { id: 't1', text: 'Standup', cat: 1, subcat: 's1', mins: 30 },
    { id: 't2', text: 'Odpovědi', cat: 1, subcat: 's2', mins: 45 },
    { id: 't3', text: 'No-sub task', cat: 1, subcat: null, mins: 15 },
    { id: 't4', text: 'Běh', cat: 2, subcat: null, mins: 60 },
  ],
};

describe('buildWordHtml', () => {
  it('renders all category headings', () => {
    const html = buildWordHtml(baseState);
    expect(html).toContain('1. Práce');
    expect(html).toContain('2. Osobní');
  });
  it('renders non-empty subcategory subheadings with subtotals', () => {
    const html = buildWordHtml(baseState);
    expect(html).toContain('Schůzky');
    expect(html).toContain('Emaily');
  });
  it('omits empty subcategories', () => {
    const state = {
      categories: ['A'],
      subcategories: [[{ id: 's1', name: 'EmptySub' }]],
      tasks: [{ id: 't', text: 'Top', cat: 1, subcat: null, mins: 10 }],
    };
    const html = buildWordHtml(state);
    expect(html).not.toContain('EmptySub');
  });
  it('shows the grand total when there are tasks', () => {
    const html = buildWordHtml(baseState);
    expect(html).toMatch(/Celkem: 4 úkolů/);
  });
  it('shows empty category placeholder', () => {
    const state = { categories: ['Empty'], subcategories: [[]], tasks: [] };
    const html = buildWordHtml(state);
    expect(html).toContain('— žádné úkoly —');
    expect(html).not.toMatch(/Celkem:/);
  });
  it('escapes html-dangerous characters in task text', () => {
    const state = {
      categories: ['X'],
      subcategories: [[]],
      tasks: [{ id: 't', text: '<script>bad</script>', cat: 1, subcat: null, mins: 0 }],
    };
    const html = buildWordHtml(state);
    expect(html).not.toContain('<script>bad</script>');
    expect(html).toContain('&lt;script&gt;bad&lt;/script&gt;');
  });
  it('tasks with stale subcat fall into noSub group', () => {
    const state = {
      categories: ['X'],
      subcategories: [[]],
      tasks: [{ id: 't', text: 'Stale', cat: 1, subcat: 'gone', mins: 0 }],
    };
    const html = buildWordHtml(state);
    expect(html).toContain('Stale');
  });
});
