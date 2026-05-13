import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryEditor } from './CategoryEditor.jsx';
import { useUkolyStore, __resetUkolyStore } from '../../store/ukolyStore.js';

describe('CategoryEditor', () => {
  beforeEach(() => __resetUkolyStore());

  it('renders all categories from the store', () => {
    render(<CategoryEditor />);
    expect(screen.getByDisplayValue('Práce')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jiné')).toBeInTheDocument();
  });

  it('adds a new category via the + button', async () => {
    const user = userEvent.setup();
    render(<CategoryEditor />);
    await user.type(screen.getByLabelText('Nová kategorie'), 'Studium');
    await user.click(screen.getByRole('button', { name: /Přidat kategorii/ }));
    expect(useUkolyStore.getState().categories).toContain('Studium');
  });

  it('renames a category on input change', () => {
    render(<CategoryEditor />);
    const input = screen.getByDisplayValue('Práce');
    fireEvent.change(input, { target: { value: 'Workflow' } });
    expect(useUkolyStore.getState().categories[0]).toBe('Workflow');
  });

  it('deletes a category after confirm', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<CategoryEditor />);
    const delButtons = screen.getAllByTitle('Smazat kategorii');
    await user.click(delButtons[0]);
    expect(useUkolyStore.getState().categories).not.toContain('Práce');
  });

  it('disables delete when only one category remains', async () => {
    useUkolyStore.setState({ categories: ['Solo'], subcategories: [[]] });
    render(<CategoryEditor />);
    const btn = screen.getByTitle('Musí zůstat alespoň jedna kategorie.');
    expect(btn).toBeDisabled();
  });

  it('adds a subcategory under a category', async () => {
    const user = userEvent.setup();
    render(<CategoryEditor />);
    await user.type(screen.getByLabelText('Nová podkategorie pro Práce'), 'Schůzky');
    const addBtns = screen.getAllByRole('button', { name: /\+ Přidat/ });
    await user.click(addBtns[0]);
    expect(useUkolyStore.getState().subcategories[0].map((s) => s.name)).toContain('Schůzky');
  });

  it('renames a subcategory on blur (and falls back when emptied)', async () => {
    useUkolyStore.getState().addSubcategory(0, 'Old');
    const subId = useUkolyStore.getState().subcategories[0][0].id;
    const user = userEvent.setup();
    render(<CategoryEditor />);
    const input = screen.getByDisplayValue('Old');
    await user.clear(input);
    await user.type(input, 'New');
    input.blur();
    expect(useUkolyStore.getState().subcategories[0].find((s) => s.id === subId).name).toBe('New');
  });

  it('deletes a subcategory', async () => {
    useUkolyStore.getState().addSubcategory(0, 'ToDel');
    const user = userEvent.setup();
    render(<CategoryEditor />);
    await user.click(screen.getByTitle('Smazat podkategorii'));
    expect(useUkolyStore.getState().subcategories[0]).toHaveLength(0);
  });
});
