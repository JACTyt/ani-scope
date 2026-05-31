import { describe, it, expect, vi, beforeEach } from 'vitest';
import { anilistFetch } from './client';

const MOCK_RESPONSE = { data: { test: true } };

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => MOCK_RESPONSE,
  }));
});

describe('anilistFetch', () => {
  it('posts to the AniList endpoint with correct headers', async () => {
    await anilistFetch('query { test }', {}, 3600);
    expect(fetch).toHaveBeenCalledWith(
      'https://graphql.anilist.co',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('returns the data field from the response', async () => {
    const result = await anilistFetch<{ test: boolean }>('query { test }', {});
    expect(result).toEqual({ test: true });
  });

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    await expect(anilistFetch('query { test }', {})).rejects.toThrow('AniList API error: 429');
  });

  it('throws when AniList returns errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: null, errors: [{ message: 'Not found' }] }),
    }));
    await expect(anilistFetch('query { test }', {})).rejects.toThrow('Not found');
  });
});
