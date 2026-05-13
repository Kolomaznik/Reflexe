import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

class MockSpeechRecognition {
  constructor() {
    this.lang = '';
    this.continuous = false;
    this.interimResults = false;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    this.started = false;
    MockSpeechRecognition.instances.push(this);
  }
  start() { this.started = true; }
  stop() {
    this.started = false;
    if (typeof this.onend === 'function') this.onend({});
  }
  emitFinal(text) {
    if (typeof this.onresult !== 'function') return;
    this.onresult({
      resultIndex: 0,
      results: [
        Object.assign([{ transcript: text }], { isFinal: true, length: 1 }),
      ],
    });
  }
}
MockSpeechRecognition.instances = [];
beforeEach(() => {
  MockSpeechRecognition.instances.length = 0;
});
globalThis.MockSpeechRecognition = MockSpeechRecognition;
window.SpeechRecognition = MockSpeechRecognition;
window.webkitSpeechRecognition = MockSpeechRecognition;

if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock');
  window.URL.revokeObjectURL = vi.fn();
}

if (!('Notification' in window)) {
  window.Notification = class {
    static permission = 'default';
    static requestPermission = vi.fn(async () => 'granted');
    constructor(title, opts) {
      this.title = title;
      this.opts = opts;
    }
  };
}

if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn(async () => {}) },
    configurable: true,
  });
}
