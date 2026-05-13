import { describe, it, expect, beforeEach } from 'vitest';
import { useUkolyStore, __resetUkolyStore, DEFAULT_CATEGORIES, STORAGE_KEY } from './ukolyStore.js';

const s = () => useUkolyStore.getState();

describe('ukolyStore', () => {
  beforeEach(() => __resetUkolyStore());

  it('starts with the 6 default categories and empty tasks', () => {
    expect(s().categories).toEqual(DEFAULT_CATEGORIES);
    expect(s().tasks).toEqual([]);
    expect(s().activeCategory).toBe(1);
    expect(s().activeSubcat).toBeNull();
    expect(s().defaultMins).toBe(30);
  });

  describe('addCategory / renameCategory / deleteCategory', () => {
    it('adds a new category', () => {
      expect(s().addCategory('Studium')).toBe(true);
      expect(s().categories).toHaveLength(7);
      expect(s().categories[6]).toBe('Studium');
      expect(s().subcategories[6]).toEqual([]);
    });
    it('refuses empty name', () => {
      expect(s().addCategory('   ')).toBe(false);
      expect(s().categories).toHaveLength(6);
    });
    it('renames a category with fallback to default when empty', () => {
      s().renameCategory(0, 'Hluboká práce');
      expect(s().categories[0]).toBe('Hluboká práce');
      s().renameCategory(0, '   ');
      expect(s().categories[0]).toBe(DEFAULT_CATEGORIES[0]);
    });
    it('renames a beyond-default category with "Kategorie N" fallback', () => {
      s().addCategory('TempName');
      s().renameCategory(6, '');
      expect(s().categories[6]).toBe('Kategorie 7');
    });
    it('refuses to delete the last remaining category', () => {
      // Reduce to 1 category by repeated delete
      for (let i = 5; i >= 1; i--) s().deleteCategory(i);
      expect(s().categories).toHaveLength(1);
      expect(s().deleteCategory(0)).toBe(false);
      expect(s().categories).toHaveLength(1);
    });
    it('cascades on delete: removes tasks in that cat, decrements higher cats', () => {
      s().setActiveCategory(1);
      s().addTask('A in 1');
      s().setActiveCategory(2);
      s().addTask('B in 2');
      s().setActiveCategory(3);
      s().addTask('C in 3');
      s().deleteCategory(1); // delete cat 2 (Osobní)
      const tasks = s().tasks;
      const names = tasks.map((t) => t.text);
      expect(names).not.toContain('B in 2');
      expect(names).toContain('A in 1');
      expect(names).toContain('C in 3');
      const cInCat = tasks.find((t) => t.text === 'C in 3').cat;
      expect(cInCat).toBe(2); // was 3, decremented
      expect(s().categories).not.toContain('Osobní');
    });
    it('clears active state if active category is deleted', () => {
      s().setActiveCategory(2);
      s().addSubcategory(1, 'X');
      const subId = s().subcategories[1][0].id;
      s().setActiveSubcat(subId);
      s().deleteCategory(1);
      expect(s().activeCategory).toBe(1);
      expect(s().activeSubcat).toBeNull();
    });
    it('decrements active category if a lower index is deleted', () => {
      s().setActiveCategory(3);
      s().deleteCategory(0);
      expect(s().activeCategory).toBe(2);
    });
  });

  describe('subcategory CRUD', () => {
    it('adds subcategory under a category', () => {
      expect(s().addSubcategory(0, 'Schůzky')).toBe(true);
      expect(s().subcategories[0]).toHaveLength(1);
      expect(s().subcategories[0][0].name).toBe('Schůzky');
      expect(typeof s().subcategories[0][0].id).toBe('string');
    });
    it('refuses empty or out-of-range', () => {
      expect(s().addSubcategory(0, '   ')).toBe(false);
      expect(s().addSubcategory(99, 'X')).toBe(false);
    });
    it('renames a subcategory', () => {
      s().addSubcategory(0, 'Old');
      const id = s().subcategories[0][0].id;
      expect(s().renameSubcategory(0, id, 'New')).toBe(true);
      expect(s().subcategories[0][0].name).toBe('New');
      expect(s().renameSubcategory(0, id, '   ')).toBe(false);
    });
    it('deletes a subcategory and clears active when matching', () => {
      s().addSubcategory(0, 'Sub');
      const id = s().subcategories[0][0].id;
      s().setActiveSubcat(id);
      s().deleteSubcategory(0, id);
      expect(s().subcategories[0]).toHaveLength(0);
      expect(s().activeSubcat).toBeNull();
    });
  });

  describe('task CRUD', () => {
    it('adds task with active cat/subcat/defaultMins', () => {
      s().addSubcategory(0, 'S');
      const id = s().subcategories[0][0].id;
      s().setActiveSubcat(id);
      s().setDefaultMins(45);
      s().addTask('Do thing');
      const t = s().tasks[0];
      expect(t.text).toBe('Do thing');
      expect(t.cat).toBe(1);
      expect(t.subcat).toBe(id);
      expect(t.mins).toBe(45);
    });
    it('moveTask across cats clears subcat', () => {
      s().addSubcategory(0, 'S');
      const subId = s().subcategories[0][0].id;
      s().setActiveSubcat(subId);
      s().addTask('X');
      const taskId = s().tasks[0].id;
      s().moveTask(taskId, 2);
      expect(s().tasks[0].cat).toBe(2);
      expect(s().tasks[0].subcat).toBeNull();
    });
    it('moveTask to same cat preserves subcat', () => {
      s().addSubcategory(0, 'S');
      const subId = s().subcategories[0][0].id;
      s().setActiveSubcat(subId);
      s().addTask('X');
      const taskId = s().tasks[0].id;
      s().moveTask(taskId, 1);
      expect(s().tasks[0].subcat).toBe(subId);
    });
    it('moveTaskSubcat validates against current cat\'s subcategories', () => {
      s().addSubcategory(0, 'A');
      const aId = s().subcategories[0][0].id;
      s().addSubcategory(1, 'B');
      const bId = s().subcategories[1][0].id;
      s().addTask('X'); // cat 1
      const taskId = s().tasks[0].id;
      s().moveTaskSubcat(taskId, bId); // bId is for cat 2, not 1 — should refuse
      expect(s().tasks[0].subcat).toBeNull();
      s().moveTaskSubcat(taskId, aId);
      expect(s().tasks[0].subcat).toBe(aId);
      s().moveTaskSubcat(taskId, null);
      expect(s().tasks[0].subcat).toBeNull();
    });
    it('updateTaskMins coerces input', () => {
      s().addTask('X');
      const id = s().tasks[0].id;
      s().updateTaskMins(id, '60.7');
      expect(s().tasks[0].mins).toBe(60);
      s().updateTaskMins(id, '-5');
      expect(s().tasks[0].mins).toBe(0);
    });
    it('deleteTask and clearTasks', () => {
      s().addTask('A');
      s().addTask('B');
      const id1 = s().tasks[0].id;
      s().deleteTask(id1);
      expect(s().tasks.map((t) => t.text)).toEqual(['B']);
      s().clearTasks();
      expect(s().tasks).toEqual([]);
    });
  });

  describe('persistence', () => {
    it('writes to localStorage under STORAGE_KEY', () => {
      s().addTask('Persist me');
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw).state.tasks[0].text).toBe('Persist me');
    });
  });

  describe('setActiveCategory', () => {
    it('clears activeSubcat', () => {
      s().addSubcategory(0, 'S');
      const id = s().subcategories[0][0].id;
      s().setActiveSubcat(id);
      s().setActiveCategory(2);
      expect(s().activeCategory).toBe(2);
      expect(s().activeSubcat).toBeNull();
    });
    it('rejects out-of-range', () => {
      s().setActiveCategory(99);
      expect(s().activeCategory).toBe(1);
    });
  });
});
