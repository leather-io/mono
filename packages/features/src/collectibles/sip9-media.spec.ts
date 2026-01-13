import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSip9MediaInfo } from './sip9-media';

const mockFetch = vi.fn();

describe(getSip9MediaInfo.name, () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch as unknown as typeof fetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
  });

  it('uses HEAD metadata when available', async () => {
    mockFetch.mockResolvedValueOnce({
      headers: {
        get: (key: string) => (key === 'content-type' ? 'image/png' : null),
      },
    } as Response);

    const media = await getSip9MediaInfo('https://example.com/nft.png');
    expect(media).toEqual({
      contentType: 'image/png',
      isAudio: false,
      isImage: true,
      isVideo: false,
    });
  });

  it('falls back to extension heuristics when HEAD fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));

    const media = await getSip9MediaInfo('https://example.com/nft.mp4');
    expect(media).toEqual({
      contentType: '',
      isAudio: false,
      isImage: false,
      isVideo: true,
    });
  });
});
