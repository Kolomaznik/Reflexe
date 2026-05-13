import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DictateButton } from './DictateButton.jsx';
import { useUkolyStore, __resetUkolyStore } from '../../store/ukolyStore.js';

describe('DictateButton', () => {
  beforeEach(() => __resetUkolyStore());

  it('starts dictation on click and toggles button label', async () => {
    const user = userEvent.setup();
    render(<DictateButton />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent(/Diktovat/);
    await user.click(btn);
    expect(btn).toHaveTextContent(/Zastavit/);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('emits final results → addTask is called with cleaned text', async () => {
    const user = userEvent.setup();
    render(<DictateButton />);
    await user.click(screen.getByRole('button'));
    const rec = globalThis.MockSpeechRecognition.instances[0];
    act(() => rec.emitFinal('  Zavolat doktora  '));
    expect(useUkolyStore.getState().tasks.map((t) => t.text)).toContain('Zavolat doktora');
  });

  it('stop button toggles back to idle', async () => {
    const user = userEvent.setup();
    render(<DictateButton />);
    const btn = screen.getByRole('button');
    await user.click(btn);
    await user.click(btn);
    expect(btn).toHaveTextContent(/Diktovat/);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects active category in status', async () => {
    useUkolyStore.getState().setActiveCategory(2);
    const user = userEvent.setup();
    render(<DictateButton />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('status')).toHaveTextContent(/Osobní/);
  });
});
