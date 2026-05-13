import { describe, it, expect, vi } from 'vitest';
import { postWebhook } from './postWebhook.js';

describe('postWebhook', () => {
  it('throws when URL is empty', async () => {
    await expect(postWebhook('', { a: 1 })).rejects.toThrow(/URL/);
  });

  it('POSTs JSON body and returns true on ok JSON', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      text: async () => JSON.stringify({ status: 'ok' }),
    }));
    globalThis.fetch = fetchMock;
    const ok = await postWebhook('https://example/exec', { aktivity: 'X' });
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example/exec');
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ aktivity: 'X' }));
    expect(opts.headers['Content-Type']).toMatch(/text\/plain/);
  });

  it('throws on HTTP non-2xx', async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 500, text: async () => '' }));
    await expect(postWebhook('https://x', {})).rejects.toThrow(/HTTP 500/);
  });

  it('accepts non-JSON success bodies', async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: true, text: async () => 'Saved!' }));
    await expect(postWebhook('https://x', {})).resolves.toBe(true);
  });

  it('rejects non-JSON body containing "error"', async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: true, text: async () => 'Some error happened' }));
    await expect(postWebhook('https://x', {})).rejects.toThrow(/error/i);
  });

  it('rejects JSON with non-ok status', async () => {
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      text: async () => JSON.stringify({ status: 'fail', message: 'Boom' }),
    }));
    await expect(postWebhook('https://x', {})).rejects.toThrow(/Boom/);
  });
});
