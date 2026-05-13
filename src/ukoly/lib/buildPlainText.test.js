import { describe, it, expect } from 'vitest';
import { buildPlainText } from './buildPlainText.js';

describe('buildPlainText', () => {
  it('renders sections for each main category', () => {
    const out = buildPlainText({
      categories: ['A', 'B'],
      subcategories: [[], []],
      tasks: [{ id: 't', text: 'Task1', cat: 1, subcat: null, mins: 30 }],
    });
    expect(out).toContain('1. A');
    expect(out).toContain('2. B');
    expect(out).toContain('• Task1');
    expect(out).toContain('— žádné úkoly —');
  });
  it('groups by subcategory with indented bullets', () => {
    const out = buildPlainText({
      categories: ['Práce'],
      subcategories: [[{ id: 's1', name: 'Schůzky' }]],
      tasks: [
        { id: 't1', text: 'Top task', cat: 1, subcat: null, mins: 0 },
        { id: 't2', text: 'Sub task', cat: 1, subcat: 's1', mins: 15 },
      ],
    });
    expect(out).toMatch(/▸ Schůzky/);
    expect(out).toMatch(/Top task/);
    expect(out).toMatch(/Sub task/);
  });
  it('omits empty subcategories', () => {
    const out = buildPlainText({
      categories: ['X'],
      subcategories: [[{ id: 's1', name: 'Hidden' }]],
      tasks: [{ id: 't', text: 'Only', cat: 1, subcat: null, mins: 0 }],
    });
    expect(out).not.toContain('Hidden');
  });
  it('appends grand total when there are tasks', () => {
    const out = buildPlainText({
      categories: ['X'],
      subcategories: [[]],
      tasks: [{ id: 't', text: 'T', cat: 1, subcat: null, mins: 60 }],
    });
    expect(out).toMatch(/CELKEM: 1 úkolů · 1 h/);
  });
});
