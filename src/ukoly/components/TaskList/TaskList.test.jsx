import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList.jsx';
import { useUkolyStore, __resetUkolyStore } from '../../store/ukolyStore.js';

function seed() {
  const st = useUkolyStore.getState();
  st.addSubcategory(0, 'Schůzky');
  st.addSubcategory(0, 'Emaily');
  const ids = useUkolyStore.getState().subcategories[0].map((x) => x.id);
  st.setActiveCategory(1);
  st.setActiveSubcat(ids[0]);
  st.addTask('Standup');
  st.setActiveSubcat(ids[1]);
  st.addTask('Reply');
  st.setActiveSubcat(null);
  st.addTask('Misc');
  st.setActiveCategory(2);
  st.addTask('Run');
  return ids;
}

describe('TaskList', () => {
  beforeEach(() => __resetUkolyStore());

  it('renders each category as a section with its tasks', () => {
    seed();
    render(<TaskList />);
    expect(screen.getByText('Standup')).toBeInTheDocument();
    expect(screen.getByText('Reply')).toBeInTheDocument();
    expect(screen.getByText('Misc')).toBeInTheDocument();
    expect(screen.getByText('Run')).toBeInTheDocument();
  });

  it('groups tasks under their subcategory headings', () => {
    seed();
    render(<TaskList />);
    // Headings include the sub name
    expect(screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent))
      .toEqual(expect.arrayContaining([expect.stringContaining('Schůzky'), expect.stringContaining('Emaily')]));
  });

  it('does not render empty subcategory groups (Emaily empty after removal)', () => {
    seed();
    const task = useUkolyStore.getState().tasks.find((t) => t.text === 'Reply');
    useUkolyStore.getState().deleteTask(task.id);
    render(<TaskList />);
    const h4s = screen.queryAllByRole('heading', { level: 4 }).map((h) => h.textContent);
    expect(h4s.some((t) => t.includes('Schůzky'))).toBe(true);
    expect(h4s.some((t) => t.includes('Emaily'))).toBe(false);
  });

  it('move-cat dropdown clears subcat when changing main category', async () => {
    const ids = seed();
    const task = useUkolyStore.getState().tasks.find((t) => t.text === 'Standup');
    const user = userEvent.setup();
    render(<TaskList />);
    const sel = screen.getByLabelText('Kategorie pro Standup');
    await user.selectOptions(sel, '2');
    const moved = useUkolyStore.getState().tasks.find((t) => t.id === task.id);
    expect(moved.cat).toBe(2);
    expect(moved.subcat).toBeNull();
  });

  it('move-subcat dropdown changes subcategory within current cat', async () => {
    seed();
    const task = useUkolyStore.getState().tasks.find((t) => t.text === 'Standup');
    const emailyId = useUkolyStore.getState().subcategories[0].find((s) => s.name === 'Emaily').id;
    const user = userEvent.setup();
    render(<TaskList />);
    const sel = screen.getByLabelText('Podkategorie pro Standup');
    await user.selectOptions(sel, emailyId);
    expect(useUkolyStore.getState().tasks.find((t) => t.id === task.id).subcat).toBe(emailyId);
  });

  it('delete button removes the task', async () => {
    seed();
    const user = userEvent.setup();
    render(<TaskList />);
    await user.click(screen.getByLabelText('Smazat Misc'));
    expect(useUkolyStore.getState().tasks.find((t) => t.text === 'Misc')).toBeUndefined();
  });

  it('mins input updates store', async () => {
    seed();
    const user = userEvent.setup();
    render(<TaskList />);
    const minsInput = screen.getByLabelText('Minuty pro Standup');
    await user.clear(minsInput);
    await user.type(minsInput, '90');
    const t = useUkolyStore.getState().tasks.find((x) => x.text === 'Standup');
    expect(t.mins).toBe(90);
  });

  it('shows grand total when there are tasks', () => {
    seed();
    render(<TaskList />);
    expect(screen.getByText(/Celkem: 4 úkolů/)).toBeInTheDocument();
  });

  it('stale subcat falls under noSub group (tolerant)', () => {
    const st = useUkolyStore.getState();
    st.addTask('Orphan');
    // Manually set a stale subcat id
    useUkolyStore.setState((s) => ({
      tasks: s.tasks.map((t) => ({ ...t, subcat: 'gone' })),
    }));
    render(<TaskList />);
    expect(screen.getByText('Orphan')).toBeInTheDocument();
  });
});
