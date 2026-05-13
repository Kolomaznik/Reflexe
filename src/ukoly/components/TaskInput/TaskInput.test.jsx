import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskInput } from './TaskInput.jsx';
import { useUkolyStore, __resetUkolyStore } from '../../store/ukolyStore.js';

describe('TaskInput', () => {
  beforeEach(() => __resetUkolyStore());

  it('adds a task on Enter, then clears the input', async () => {
    const user = userEvent.setup();
    render(<TaskInput />);
    const input = screen.getByLabelText('Nový úkol');
    await user.type(input, 'Brush teeth{Enter}');
    expect(useUkolyStore.getState().tasks).toHaveLength(1);
    expect(useUkolyStore.getState().tasks[0].text).toBe('Brush teeth');
    expect(input).toHaveValue('');
  });

  it('adds a task by clicking the button', async () => {
    const user = userEvent.setup();
    render(<TaskInput />);
    await user.type(screen.getByLabelText('Nový úkol'), 'Buy milk');
    await user.click(screen.getByRole('button', { name: /Přidat/ }));
    expect(useUkolyStore.getState().tasks[0].text).toBe('Buy milk');
  });

  it('uses the active category + subcategory + defaultMins', async () => {
    useUkolyStore.getState().setActiveCategory(3);
    useUkolyStore.getState().addSubcategory(2, 'X');
    const subId = useUkolyStore.getState().subcategories[2][0].id;
    useUkolyStore.getState().setActiveSubcat(subId);
    useUkolyStore.getState().setDefaultMins(45);
    const user = userEvent.setup();
    render(<TaskInput />);
    await user.type(screen.getByLabelText('Nový úkol'), 'A{Enter}');
    const t = useUkolyStore.getState().tasks[0];
    expect(t.cat).toBe(3);
    expect(t.subcat).toBe(subId);
    expect(t.mins).toBe(45);
  });

  it('ignores empty input', async () => {
    const user = userEvent.setup();
    render(<TaskInput />);
    await user.click(screen.getByRole('button', { name: /Přidat/ }));
    expect(useUkolyStore.getState().tasks).toHaveLength(0);
  });
});
