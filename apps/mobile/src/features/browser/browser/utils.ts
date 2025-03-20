import { RefObject } from 'react';
import ViewShot, { captureRef } from 'react-native-view-shot';

import * as FileSystem from 'expo-file-system';
import { z } from 'zod';

export type BrowserSheetTab = 'suggested' | 'connected' | 'recent';

export const URL_SEARCH_HEIGHT = 70;

export function formatURL(url: string) {
  if (url.startsWith('http')) {
    return url;
  }
  return 'https://' + url;
}

export type BrowserType = 'active' | 'inactive';

export const messagePartialZodObject = z.object({
  id: z.string(),
  jsonrpc: z.string(),
  method: z.string(),
});

function getScreenshotPath(hostname: string) {
  return `${FileSystem.documentDirectory}${hostname}_screenshot.jpg`;
}
// Capture screenshot using react-native-view-shot
export async function captureScreenshot(viewShotRef: RefObject<ViewShot>, hostname: string) {
  if (!viewShotRef.current) return;

  try {
    // For some reason on iOS we can't read a tmpfile, we need to use b64 here
    const b64string = await captureRef(viewShotRef, {
      format: 'png',
      quality: 0.6,
      width: 300,
      height: 600,
      result: 'base64',
    });

    const screenshotPath = getScreenshotPath(hostname);

    await FileSystem.writeAsStringAsync(screenshotPath, b64string, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return screenshotPath;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error capturing screenshot:', error);
    return;
  }
}
