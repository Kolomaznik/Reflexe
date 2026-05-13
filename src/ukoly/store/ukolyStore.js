import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uid } from '../../shared/lib/uid.js';
import { coerceMins } from '../lib/formatters.js';

export const DEFAULT_CATEGORIES = ['Práce', 'Osobní', 'Domácnost', 'Zdraví', 'Nákupy', 'Jiné'];
export const STORAGE_KEY = 'ukoly_state_v2';
export const QUICK_MINS = [5, 15, 30, 60, 120];

function nameFallback(idx, current) {
  return (current && String(current).trim()) || DEFAULT_CATEGORIES[idx] || `Kategorie ${idx + 1}`;
}

function initialState() {
  return {
    categories: [...DEFAULT_CATEGORIES],
    subcategories: [[], [], [], [], [], []],
    tasks: [],
    activeCategory: 1,
    activeSubcat: null,
    defaultMins: 30,
  };
}

export const useUkolyStore = create(
  persist(
    (set, get) => ({
      ...initialState(),

      // ---------- Category CRUD ----------
      addCategory(name) {
        const n = (name || '').trim();
        if (!n) return false;
        set((s) => ({
          categories: [...s.categories, n],
          subcategories: [...s.subcategories, []],
        }));
        return true;
      },
      renameCategory(idx, name) {
        if (!Number.isInteger(idx) || idx < 0 || idx >= get().categories.length) return;
        set((s) => {
          const cats = [...s.categories];
          cats[idx] = nameFallback(idx, name);
          return { categories: cats };
        });
      },
      deleteCategory(idx) {
        const s = get();
        if (!Number.isInteger(idx) || idx < 0 || idx >= s.categories.length) return false;
        if (s.categories.length <= 1) return false;
        const k = idx + 1;
        const newCats = s.categories.filter((_, i) => i !== idx);
        const newSubs = s.subcategories.filter((_, i) => i !== idx);
        const newTasks = s.tasks
          .filter((t) => t.cat !== k)
          .map((t) => (t.cat > k ? { ...t, cat: t.cat - 1 } : t));
        let activeCategory = s.activeCategory;
        let activeSubcat = s.activeSubcat;
        if (activeCategory === k) {
          activeCategory = 1;
          activeSubcat = null;
        } else if (activeCategory > k) {
          activeCategory -= 1;
        }
        if (activeCategory > newCats.length) activeCategory = newCats.length;
        set({ categories: newCats, subcategories: newSubs, tasks: newTasks, activeCategory, activeSubcat });
        return true;
      },

      // ---------- Subcategory CRUD ----------
      addSubcategory(catIdx, name) {
        const n = (name || '').trim();
        if (!n) return false;
        if (!Number.isInteger(catIdx) || catIdx < 0 || catIdx >= get().categories.length) return false;
        set((s) => {
          const subs = s.subcategories.map((arr) => [...arr]);
          subs[catIdx].push({ id: uid(), name: n });
          return { subcategories: subs };
        });
        return true;
      },
      renameSubcategory(catIdx, id, name) {
        const n = (name || '').trim();
        if (!n) return false;
        const s = get();
        if (!Number.isInteger(catIdx) || catIdx < 0 || catIdx >= s.categories.length) return false;
        const sub = (s.subcategories[catIdx] || []).find((x) => x.id === id);
        if (!sub) return false;
        set((s2) => {
          const subs = s2.subcategories.map((arr, i) =>
            i === catIdx ? arr.map((x) => (x.id === id ? { ...x, name: n } : x)) : arr,
          );
          return { subcategories: subs };
        });
        return true;
      },
      deleteSubcategory(catIdx, id) {
        const s = get();
        if (!Number.isInteger(catIdx) || catIdx < 0 || catIdx >= s.categories.length) return;
        const subs = s.subcategories.map((arr, i) =>
          i === catIdx ? arr.filter((x) => x.id !== id) : arr,
        );
        const next = { subcategories: subs };
        if (s.activeCategory === catIdx + 1 && s.activeSubcat === id) {
          next.activeSubcat = null;
        }
        set(next);
      },

      // ---------- Active selectors ----------
      setActiveCategory(num) {
        const len = get().categories.length;
        if (!(Number.isInteger(num) && num >= 1 && num <= len)) return;
        set({ activeCategory: num, activeSubcat: null });
      },
      setActiveSubcat(id) {
        set({ activeSubcat: id });
      },
      setDefaultMins(n) {
        set({ defaultMins: coerceMins(n) });
      },

      // ---------- Task CRUD ----------
      addTask(text) {
        const t = (text || '').trim();
        if (!t) return false;
        const s = get();
        set({
          tasks: [
            ...s.tasks,
            {
              id: uid(),
              text: t,
              cat: s.activeCategory,
              subcat: s.activeSubcat,
              mins: s.defaultMins,
            },
          ],
        });
        return true;
      },
      moveTask(id, newCat) {
        const len = get().categories.length;
        if (!(Number.isInteger(newCat) && newCat >= 1 && newCat <= len)) return;
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, cat: newCat, subcat: t.cat === newCat ? t.subcat : null }
              : t,
          ),
        }));
      },
      moveTaskSubcat(id, newSubcat) {
        const s = get();
        const task = s.tasks.find((t) => t.id === id);
        if (!task) return;
        if (newSubcat !== null) {
          const subs = s.subcategories[task.cat - 1] || [];
          if (!subs.some((x) => x.id === newSubcat)) return;
        }
        set((s2) => ({
          tasks: s2.tasks.map((t) => (t.id === id ? { ...t, subcat: newSubcat } : t)),
        }));
      },
      updateTaskMins(id, mins) {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, mins: coerceMins(mins) } : t)),
        }));
      },
      deleteTask(id) {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      },
      clearTasks() {
        set({ tasks: [] });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // Tolerant hydration: pad/truncate subcategories, clamp task.cat / activeCategory, normalize subcategory entries.
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== 'object') return current;
        const state = { ...current, ...persisted };
        if (Array.isArray(state.categories) && state.categories.length >= 1) {
          state.categories = state.categories.map((s, i) =>
            (s && String(s).trim()) || DEFAULT_CATEGORIES[i] || `Kategorie ${i + 1}`,
          );
        } else {
          state.categories = current.categories;
        }
        const N = state.categories.length;
        const loadedSubs = Array.isArray(state.subcategories) ? state.subcategories : [];
        state.subcategories = state.categories.map((_, i) => {
          const arr = Array.isArray(loadedSubs[i]) ? loadedSubs[i] : [];
          return arr
            .filter((x) => x && typeof x.name === 'string' && x.name.trim())
            .map((x) => ({
              id: typeof x.id === 'string' && x.id ? x.id : uid(),
              name: x.name.trim(),
            }));
        });
        if (Array.isArray(state.tasks)) {
          state.tasks = state.tasks
            .filter((t) => t && typeof t.text === 'string' && t.text.trim())
            .map((t) => ({
              id: typeof t.id === 'string' && t.id ? t.id : uid(),
              text: t.text.trim(),
              cat: Number.isInteger(t.cat) && t.cat >= 1 && t.cat <= N ? t.cat : 1,
              subcat: typeof t.subcat === 'string' && t.subcat ? t.subcat : null,
              mins: coerceMins(t.mins),
            }));
        } else {
          state.tasks = [];
        }
        if (!(Number.isInteger(state.activeCategory) && state.activeCategory >= 1 && state.activeCategory <= N)) {
          state.activeCategory = 1;
        }
        if (typeof state.activeSubcat !== 'string') state.activeSubcat = null;
        state.defaultMins = coerceMins(state.defaultMins);
        if (state.defaultMins === 0) state.defaultMins = 30;
        return state;
      },
    },
  ),
);

// Test helper — reset store to initial state without wiping actions.
export function __resetUkolyStore() {
  localStorage.removeItem(STORAGE_KEY);
  useUkolyStore.setState(initialState());
}
