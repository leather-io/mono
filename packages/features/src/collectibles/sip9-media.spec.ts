import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSip9MediaInfo } from './sip9-media';

const mockFetch = vi.fn();

describe(getSip9MediaInfo.name, () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
  });

  it('uses HEAD response metadata when available', async () => {
    mockFetch.mockResolvedValueOnce({
      headers: {
        get: (key: string) => (key === 'content-type' ? 'image/png' : null),
      },
    } as Response);

    const info = await getSip9MediaInfo('https://example.com/nft.png');
    expect(info).toEqual({
      contentType: 'image/png',
      isAudio: false,
      isImage: true,
      isVideo: false,
    });
  });

  it('falls back to file extension heuristics on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));

    const info = await getSip9MediaInfo('https://example.com/nft.mp4');
    expect(info).toEqual({
      contentType: '',
      isAudio: false,
      isImage: false,
      isVideo: true,
    });
  });
});
