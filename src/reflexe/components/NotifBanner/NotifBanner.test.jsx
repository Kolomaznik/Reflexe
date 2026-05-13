import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotifBanner } from './NotifBanner.jsx';
import { useReflexeStore, __resetReflexeStore } from '../../store/reflexeStore.js';

describe('NotifBanner', () => {
  beforeEach(() => {
    __resetReflexeStore();
    window.Notification.permission = 'default';
  });

  it('shows the "turn on" prompt by default', () => {
    render(<NotifBanner onToast={() => {}} />);
    expect(screen.getByText(/Zapnout připomínky/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zapnout' })).toBeInTheDocument();
  });

  it('requests permission and enables reminders on success', async () => {
    window.Notification.requestPermission = vi.fn(async () => {
      window.Notification.permission = 'granted';
      return 'granted';
    });
    const toast = vi.fn();
    const user = userEvent.setup();
    render(<NotifBanner onToast={toast} />);
    await user.click(screen.getByRole('button', { name: 'Zapnout' }));
    expect(useReflexeStore.getState().remindersEnabled).toBe(true);
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/zapnuté/));
  });

  it('toast when permission is denied', async () => {
    window.Notification.requestPermission = vi.fn(async () => 'denied');
    const toast = vi.fn();
    const user = userEvent.setup();
    render(<NotifBanner onToast={toast} />);
    await user.click(screen.getByRole('button', { name: 'Zapnout' }));
    expect(useReflexeStore.getState().remindersEnabled).toBe(false);
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/nepovoleny/));
  });

  it('shows disable button when already enabled', () => {
    window.Notification.permission = 'granted';
    useReflexeStore.getState().setRemindersEnabled(true);
    render(<NotifBanner onToast={() => {}} />);
    expect(screen.getByRole('button', { name: 'Vypnout' })).toBeInTheDocument();
  });
});
