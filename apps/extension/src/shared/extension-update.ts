import { isString } from '@leather.io/utils';

export const extensionUpdateStorageKeys = {
  pendingVersion: 'pending-update-version',
  appliedVersion: 'applied-update-version',
  updateTiming: 'update-timing',
} as const;

export async function setPendingUpdateVersion(version: string) {
  return chrome.storage.session.set({ [extensionUpdateStorageKeys.pendingVersion]: version });
}

export async function getPendingUpdateVersion() {
  const result = await chrome.storage.session.get(extensionUpdateStorageKeys.pendingVersion);
  const version: unknown = result[extensionUpdateStorageKeys.pendingVersion];
  return isString(version) ? version : null;
}

export async function clearPendingUpdateVersion() {
  return chrome.storage.session.remove(extensionUpdateStorageKeys.pendingVersion);
}

export async function setAppliedUpdateVersion(version: string) {
  return chrome.storage.local.set({ [extensionUpdateStorageKeys.appliedVersion]: version });
}

export async function getAppliedUpdateVersion() {
  const result = await chrome.storage.local.get(extensionUpdateStorageKeys.appliedVersion);
  const version: unknown = result[extensionUpdateStorageKeys.appliedVersion];
  return isString(version) ? version : null;
}

export async function clearAppliedUpdateVersion() {
  return chrome.storage.local.remove(extensionUpdateStorageKeys.appliedVersion);
}
