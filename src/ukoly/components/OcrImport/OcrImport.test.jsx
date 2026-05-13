import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OcrImport, __resetOcrWorker } from './OcrImport.jsx';
import { useUkolyStore, __resetUkolyStore } from '../../store/ukolyStore.js';

function mockTess() {
  return {
    createWorker: vi.fn(async (langs, oem, opts) => ({
      recognize: vi.fn(async () => ({
        data: { text: '• První úkol\n2. Druhý úkol\n[x] Hotovo' },
      })),
    })),
  };
}

describe('OcrImport', () => {
  beforeEach(() => {
    __resetUkolyStore();
    __resetOcrWorker();
  });

  it('processes an image and adds cleaned tasks', async () => {
    const user = userEvent.setup();
    const loadTesseract = vi.fn(async () => mockTess());
    render(<OcrImport loadTesseract={loadTesseract} />);
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const input = screen.getByLabelText('OCR soubor');
    await user.upload(input, file);
    await waitFor(() => {
      const texts = useUkolyStore.getState().tasks.map((t) => t.text);
      expect(texts).toContain('První úkol');
      expect(texts).toContain('Druhý úkol');
      expect(texts).toContain('Hotovo');
    });
    expect(loadTesseract).toHaveBeenCalled();
  });

  it('shows a status when no text was found', async () => {
    const user = userEvent.setup();
    const loadTesseract = vi.fn(async () => ({
      createWorker: async () => ({ recognize: async () => ({ data: { text: '   \n\n' } }) }),
    }));
    render(<OcrImport loadTesseract={loadTesseract} />);
    const file = new File(['x'], 'blank.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('OCR soubor'), file);
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/nebyl rozpoznán/);
    });
  });

  it('shows an error status when OCR throws', async () => {
    const user = userEvent.setup();
    const loadTesseract = vi.fn(async () => { throw new Error('Boom'); });
    render(<OcrImport loadTesseract={loadTesseract} />);
    const file = new File(['x'], 'fail.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('OCR soubor'), file);
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/OCR chyba/);
    });
  });
});
