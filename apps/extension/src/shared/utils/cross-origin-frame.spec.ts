import { describe, expect, it } from 'vitest';

import { isCrossOriginFrameRequest } from './cross-origin-frame';

describe(isCrossOriginFrameRequest.name, () => {
  it('returns false for top-level frame requests', () => {
    expect(
      isCrossOriginFrameRequest({
        origin: 'https://app.example.com',
        topOrigin: 'https://app.example.com',
        frameId: 0,
      })
    ).toBe(false);
  });

  it('returns false for same-origin subframe requests', () => {
    expect(
      isCrossOriginFrameRequest({
        origin: 'https://app.example.com',
        topOrigin: 'https://app.example.com',
        frameId: 123,
      })
    ).toBe(false);
  });

  it('returns true for cross-origin subframe requests', () => {
    expect(
      isCrossOriginFrameRequest({
        origin: 'https://widget.other.com',
        topOrigin: 'https://app.example.com',
        frameId: 123,
      })
    ).toBe(true);
  });

  it('returns true for subframe requests with unknown top origin', () => {
    expect(
      isCrossOriginFrameRequest({
        origin: 'https://widget.other.com',
        topOrigin: null,
        frameId: 123,
      })
    ).toBe(true);
  });
});
