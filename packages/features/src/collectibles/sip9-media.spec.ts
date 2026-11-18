import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSip9MediaInfo } from './sip9-media';

const mockFetch = vi.fn<typeof fetch>();

describe(getSip9MediaInfo.name, () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
  });

  it('uses HEAD metadata when available', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(null, { headers: { 'content-type': 'image/png' } })
    );

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
      contentType: null,
      isAudio: false,
      isImage: false,
      isVideo: true,
    });
  });
});
