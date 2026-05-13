import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveCategoryPicker } from './ActiveCategoryPicker.jsx';
import { useUkolyStore, __resetUkolyStore } from '../../store/ukolyStore.js';

describe('ActiveCategoryPicker', () => {
  beforeEach(() => __resetUkolyStore());

  it('renders one button per category and marks the active one', () => {
    render(<ActiveCategoryPicker />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('clicking a button changes the active category', async () => {
    const user = userEvent.setup();
    render(<ActiveCategoryPicker />);
    await user.click(screen.getByText('Osobní'));
    expect(useUkolyStore.getState().activeCategory).toBe(2);
  });

  it('does not show sub-picker when active cat has no subs', () => {
    render(<ActiveCategoryPicker />);
    expect(screen.queryByText('— bez podkategorie')).not.toBeInTheDocument();
  });

  it('shows sub-picker when active cat has subs and switches reset it', async () => {
    useUkolyStore.getState().addSubcategory(0, 'Schůzky');
    useUkolyStore.getState().addSubcategory(0, 'Emaily');
    const user = userEvent.setup();
    render(<ActiveCategoryPicker />);
    expect(screen.getByText('— bez podkategorie')).toBeInTheDocument();
    expect(screen.getByText('Schůzky')).toBeInTheDocument();
    await user.click(screen.getByText('Schůzky'));
    expect(useUkolyStore.getState().activeSubcat).toBeTruthy();
    await user.click(screen.getByText('Osobní'));
    expect(useUkolyStore.getState().activeCategory).toBe(2);
    expect(useUkolyStore.getState().activeSubcat).toBeNull();
  });

  it('clicking "— bez podkategorie" clears activeSubcat', async () => {
    useUkolyStore.getState().addSubcategory(0, 'X');
    const subId = useUkolyStore.getState().subcategories[0][0].id;
    useUkolyStore.getState().setActiveSubcat(subId);
    const user = userEvent.setup();
    render(<ActiveCategoryPicker />);
    await user.click(screen.getByText('— bez podkategorie'));
    expect(useUkolyStore.getState().activeSubcat).toBeNull();
  });
});
