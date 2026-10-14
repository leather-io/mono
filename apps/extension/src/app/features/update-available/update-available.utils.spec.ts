import { describe, expect, it } from 'vitest';

import {
  makeUpdateAvailableMessageId,
  selectShouldShowUpdateCallout,
} from './update-available.utils';

const defaultArgs = {
  pendingVersion: '6.113.0',
  currentVersion: '6.112.1',
  isRequestWindow: false,
  isWalletReady: true,
  dismissedMessageIds: [],
};

describe(selectShouldShowUpdateCallout.name, () => {
  it('shows when a newer version is pending', () => {
    expect(selectShouldShowUpdateCallout(defaultArgs)).toBe(true);
  });

  it('hides when nothing is pending', () => {
    expect(selectShouldShowUpdateCallout({ ...defaultArgs, pendingVersion: null })).toBe(false);
  });

  it('hides when the pending version is already running', () => {
    expect(selectShouldShowUpdateCallout({ ...defaultArgs, pendingVersion: '6.112.1' })).toBe(
      false
    );
  });

  it('hides when a later version than the one announced got installed', () => {
    expect(
      selectShouldShowUpdateCallout({
        ...defaultArgs,
        pendingVersion: '6.113.0',
        currentVersion: '6.113.1',
      })
    ).toBe(false);
  });

  it('hides when the stored version cannot be compared', () => {
    expect(selectShouldShowUpdateCallout({ ...defaultArgs, pendingVersion: 'not-a-version' })).toBe(
      false
    );
  });

  it('hides in windows opened by a connected app', () => {
    expect(selectShouldShowUpdateCallout({ ...defaultArgs, isRequestWindow: true })).toBe(false);
  });

  it('hides while the wallet is locked or not yet onboarded', () => {
    expect(selectShouldShowUpdateCallout({ ...defaultArgs, isWalletReady: false })).toBe(false);
  });

  it('hides once that version has been postponed', () => {
    expect(
      selectShouldShowUpdateCallout({
        ...defaultArgs,
        dismissedMessageIds: [makeUpdateAvailableMessageId('6.113.0')],
      })
    ).toBe(false);
  });

  it('shows again when a newer version arrives after a postponement', () => {
    expect(
      selectShouldShowUpdateCallout({
        ...defaultArgs,
        pendingVersion: '6.114.0',
        dismissedMessageIds: [makeUpdateAvailableMessageId('6.113.0')],
      })
    ).toBe(true);
  });
});
