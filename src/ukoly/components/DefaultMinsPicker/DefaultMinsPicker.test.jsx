import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DefaultMinsPicker } from './DefaultMinsPicker.jsx';
import { useUkolyStore, __resetUkolyStore } from '../../store/ukolyStore.js';

describe('DefaultMinsPicker', () => {
  beforeEach(() => __resetUkolyStore());

  it('renders the quick chips and the active one', () => {
    render(<DefaultMinsPicker />);
    const active = screen.getByRole('button', { name: '30' });
    expect(active).toHaveAttribute('aria-pressed', 'true');
  });

  it('clicking a chip updates defaultMins', async () => {
    const user = userEvent.setup();
    render(<DefaultMinsPicker />);
    await user.click(screen.getByRole('button', { name: '60' }));
    expect(useUkolyStore.getState().defaultMins).toBe(60);
  });

  it('custom input updates defaultMins', async () => {
    const user = userEvent.setup();
    render(<DefaultMinsPicker />);
    const input = screen.getByLabelText('Vlastní čas v minutách');
    await user.clear(input);
    await user.type(input, '90');
    expect(useUkolyStore.getState().defaultMins).toBe(90);
  });
});
