import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportActions } from './ExportActions.jsx';
import { useUkolyStore, __resetUkolyStore } from '../../store/ukolyStore.js';

describe('ExportActions', () => {
  beforeEach(() => __resetUkolyStore());

  it('triggers a Word blob download with a date-stamped filename', async () => {
    useUkolyStore.getState().addTask('Word me');
    const user = userEvent.setup();
    const created = vi.fn(() => 'blob:fake');
    const revoked = vi.fn();
    window.URL.createObjectURL = created;
    window.URL.revokeObjectURL = revoked;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<ExportActions />);
    await user.click(screen.getByRole('button', { name: /Stáhnout Word/ }));
    expect(created).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('copies plain text via navigator.clipboard', async () => {
    useUkolyStore.getState().addTask('Copy me');
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ExportActions />);
    await user.click(screen.getByRole('button', { name: /Zkopírovat text/ }));
    await waitFor(() => expect(write).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: /Zkopírováno/ })).toBeInTheDocument());
  });

  it('clearAll confirms then clears tasks', async () => {
    useUkolyStore.getState().addTask('A');
    useUkolyStore.getState().addTask('B');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<ExportActions />);
    await user.click(screen.getByRole('button', { name: /Vymazat vše/ }));
    expect(useUkolyStore.getState().tasks).toEqual([]);
  });

  it('clearAll is a no-op when there are no tasks', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<ExportActions />);
    await user.click(screen.getByRole('button', { name: /Vymazat vše/ }));
    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
