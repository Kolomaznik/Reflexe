import { describe, it, expect } from 'vitest';
import { cleanOcrLine, ocrLinesFromText } from './ocrCleaner.js';

describe('cleanOcrLine', () => {
  it('strips bullet prefixes', () => {
    expect(cleanOcrLine('• Mléko')).toBe('Mléko');
    expect(cleanOcrLine('- Chleba')).toBe('Chleba');
    expect(cleanOcrLine('* Máslo')).toBe('Máslo');
    expect(cleanOcrLine('— Káva')).toBe('Káva');
  });
  it('strips numbered prefixes', () => {
    expect(cleanOcrLine('1. První úkol')).toBe('První úkol');
    expect(cleanOcrLine('2) Druhý')).toBe('Druhý');
    expect(cleanOcrLine('  10. Desátý')).toBe('Desátý');
  });
  it('strips checkbox prefixes', () => {
    expect(cleanOcrLine('[ ] Není hotovo')).toBe('Není hotovo');
    expect(cleanOcrLine('[x] Hotovo')).toBe('Hotovo');
    expect(cleanOcrLine('☐ Otevřené')).toBe('Otevřené');
    expect(cleanOcrLine('✓ Splněné')).toBe('Splněné');
  });
  it('collapses internal whitespace', () => {
    expect(cleanOcrLine('  více   mezer   tady  ')).toBe('více mezer tady');
  });
});

describe('ocrLinesFromText', () => {
  it('splits, cleans, and filters short / junk lines', () => {
    const text = '• Mléko\n- Chleba\n\n1. Telefonát\n   \n.\n[x] Hotovo';
    expect(ocrLinesFromText(text)).toEqual(['Mléko', 'Chleba', 'Telefonát', 'Hotovo']);
  });
  it('drops lines without letters or numbers', () => {
    expect(ocrLinesFromText('---\n***\n***\nReal task')).toEqual(['Real task']);
  });
});
