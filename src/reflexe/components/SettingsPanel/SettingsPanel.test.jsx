import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from './SettingsPanel.jsx';
import { useReflexeStore, __resetReflexeStore, K_WEBHOOK } from '../../store/reflexeStore.js';

describe('SettingsPanel', () => {
  beforeEach(() => __resetReflexeStore());

  it('saves the webhook URL via the Uložit button', async () => {
    const toast = vi.fn();
    const user = userEvent.setup();
    render(<SettingsPanel onToast={toast} />);
    await user.type(screen.getByLabelText('URL Google Apps Script (webhook)'),
      'https://script.google.com/macros/s/abc/exec');
    await user.click(screen.getByRole('button', { name: 'Uložit' }));
    expect(localStorage.getItem(K_WEBHOOK)).toBe('https://script.google.com/macros/s/abc/exec');
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/Webhook uložen/));
  });

  it('confirms before saving a non-Google URL', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const toast = vi.fn();
    const user = userEvent.setup();
    render(<SettingsPanel onToast={toast} />);
    await user.type(screen.getByLabelText('URL Google Apps Script (webhook)'), 'https://other');
    await user.click(screen.getByRole('button', { name: 'Uložit' }));
    expect(localStorage.getItem(K_WEBHOOK)).toBeNull();
  });

  it('clear button removes the webhook', async () => {
    useReflexeStore.getState().setWebhookUrl('https://x');
    const toast = vi.fn();
    const user = userEvent.setup();
    render(<SettingsPanel onToast={toast} />);
    await user.click(screen.getByRole('button', { name: 'Smazat' }));
    expect(useReflexeStore.getState().webhookUrl).toBe('');
  });

  it('test button calls the post fn and toasts success', async () => {
    const post = vi.fn(async () => true);
    const toast = vi.fn();
    const user = userEvent.setup();
    render(<SettingsPanel onToast={toast} post={post} />);
    await user.type(screen.getByLabelText('URL Google Apps Script (webhook)'),
      'https://script.google.com/x/exec');
    await user.click(screen.getByRole('button', { name: 'Test odeslání' }));
    await waitFor(() => expect(post).toHaveBeenCalled());
    await waitFor(() => expect(toast).toHaveBeenLastCalledWith(expect.stringMatching(/Test OK/)));
  });

  it('test button shows error on post failure', async () => {
    const post = vi.fn(async () => { throw new Error('Boom'); });
    const toast = vi.fn();
    const user = userEvent.setup();
    render(<SettingsPanel onToast={toast} post={post} />);
    await user.type(screen.getByLabelText('URL Google Apps Script (webhook)'),
      'https://script.google.com/x/exec');
    await user.click(screen.getByRole('button', { name: 'Test odeslání' }));
    await waitFor(() => expect(toast).toHaveBeenLastCalledWith(expect.stringMatching(/Chyba: Boom/)));
  });
});
