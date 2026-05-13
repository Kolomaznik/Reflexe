import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReflexeForm } from './ReflexeForm.jsx';

describe('ReflexeForm', () => {
  it('submits with all 8 questions captured into the payload', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ReflexeForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/Psaní nabídky/), 'Code review');
    fireEvent.change(screen.getByLabelText('Skóre 1–10:', { selector: 'input[name=pareto_score]' }) ||
      screen.getAllByLabelText('Skóre 1–10:')[0],
      { target: { value: '9' } });

    await user.click(screen.getByRole('button', { name: /Uložit reflexi/ }));
    expect(onSubmit).toHaveBeenCalledOnce();
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.aktivity).toBe('Code review');
    expect(payload.pareto_score).toBe('9');
  });

  it('starts with default value 5 on every slider', () => {
    render(<ReflexeForm onSubmit={() => {}} />);
    const sliders = screen.getAllByRole('slider');
    // Pareto, Parkinson, Posun, Setup, Focus, Vedomost, Vyruseni = 7 sliders
    expect(sliders).toHaveLength(7);
    sliders.forEach((s) => expect(s).toHaveValue('5'));
  });

  it('percent inputs accept numeric strings', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ReflexeForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText(/% přispění k cíli dne:/), '75');
    await user.click(screen.getByRole('button', { name: /Uložit reflexi/ }));
    expect(onSubmit.mock.calls[0][0].pareto_percent).toBe('75');
  });
});
