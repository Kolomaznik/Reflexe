import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultPanel, useSubmitReflection } from './ResultPanel.jsx';
import { useReflexeStore, __resetReflexeStore } from '../../store/reflexeStore.js';

describe('ResultPanel (presentation)', () => {
  it('renders message, hint (as HTML) and JSON', () => {
    render(<ResultPanel json='{"a":1}' status="ok" message="Uloženo" hint="<strong>OK</strong>" onNew={() => {}} />);
    expect(screen.getByText('Uloženo')).toBeInTheDocument();
    expect(screen.getByText('OK').tagName).toBe('STRONG');
    expect(screen.getByText('{"a":1}')).toBeInTheDocument();
  });
  it('shows retry button only in offline state', () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <ResultPanel json="" status="ok" message="" hint="" onRetry={onRetry} onNew={() => {}} />,
    );
    expect(screen.queryByRole('button', { name: /Zkusit znovu/ })).not.toBeInTheDocument();
    rerender(<ResultPanel json="" status="offline" message="" hint="" onRetry={onRetry} onNew={() => {}} />);
    expect(screen.getByRole('button', { name: /Zkusit znovu/ })).toBeInTheDocument();
  });
});

describe('useSubmitReflection (logic)', () => {
  beforeEach(() => __resetReflexeStore());

  it('without webhook URL: copies JSON, status info, adds to history', async () => {
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    const { result } = renderHook(() => useSubmitReflection());
    await act(async () => {
      await result.current.submit({ aktivity: 'X', celkovy_skor: 5 });
    });
    expect(result.current.state.status).toBe('info');
    expect(useReflexeStore.getState().history).toHaveLength(1);
    expect(write).toHaveBeenCalled();
  });

  it('with webhook + post success: status ok, no enqueue, history added', async () => {
    useReflexeStore.getState().setWebhookUrl('https://x');
    const post = vi.fn(async () => true);
    const { result } = renderHook(() => useSubmitReflection());
    await act(async () => {
      await result.current.submit({ aktivity: 'X' }, { post });
    });
    expect(result.current.state.status).toBe('ok');
    expect(useReflexeStore.getState().queue).toHaveLength(0);
    expect(useReflexeStore.getState().history).toHaveLength(1);
  });

  it('with webhook + post failure: status offline, payload queued', async () => {
    useReflexeStore.getState().setWebhookUrl('https://x');
    const post = vi.fn(async () => { throw new Error('Boom'); });
    const { result } = renderHook(() => useSubmitReflection());
    await act(async () => {
      await result.current.submit({ aktivity: 'X' }, { post });
    });
    expect(result.current.state.status).toBe('offline');
    expect(useReflexeStore.getState().queue).toHaveLength(1);
  });

  it('retry flushes queue', async () => {
    useReflexeStore.getState().setWebhookUrl('https://x');
    useReflexeStore.getState().enqueue({ a: 1 });
    const post = vi.fn(async () => true);
    const { result } = renderHook(() => useSubmitReflection());
    await act(async () => {
      await result.current.retry({ post });
    });
    expect(result.current.state.status).toBe('ok');
    expect(useReflexeStore.getState().queue).toHaveLength(0);
  });
});
