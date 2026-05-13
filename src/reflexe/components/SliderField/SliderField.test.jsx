import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SliderField } from './SliderField.jsx';

describe('SliderField', () => {
  it('renders the label, value and slider', () => {
    render(<SliderField label="Skóre 1–10:" value={5} onChange={() => {}} name="x" />);
    expect(screen.getByText('Skóre 1–10:')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toHaveValue('5');
    // value display uses aria-live
    expect(screen.getByText('5', { selector: '[aria-live]' })).toBeInTheDocument();
  });
  it('fires onChange with the new value', () => {
    const cb = vi.fn();
    render(<SliderField label="L" value={5} onChange={cb} name="x" />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '8' } });
    expect(cb).toHaveBeenCalledWith('8');
  });
});
