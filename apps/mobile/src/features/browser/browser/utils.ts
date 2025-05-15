import { RefObject } from 'react';
import ViewShot, { captureRef } from 'react-native-view-shot';

import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system';
import { z } from 'zod';

import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  endpoints,
  getInfo,
  supportedMethods,
} from '@leather.io/rpc';

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
export async function captureScreenshot(viewShotRef: RefObject<ViewShot | null>, hostname: string) {
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

const unsupportedMethods = ['stxGetNetworks', 'stxUpdateProfile', 'open', 'openSwap'];

const supportedMethodsLinks = Object.keys(endpoints)
  .filter(method => !unsupportedMethods.includes(method))
  .map(method => ({
    name: method,
    docsUrl: 'https://leather.gitbook.io/developers',
  }));

export function createSupportedMethodsResponse(
  request: RpcRequest<typeof supportedMethods>
): RpcResponse<typeof supportedMethods> {
  return createRpcSuccessResponse(supportedMethods.method, {
    id: request.id,
    result: {
      documentation: 'https://leather.gitbook.io/developers/home/welcome',
      methods: supportedMethodsLinks,
    },
  });
}

export function createGetInfoResponse(
  request: RpcRequest<typeof getInfo>
): RpcResponse<typeof getInfo> {
  return createRpcSuccessResponse(getInfo.method, {
    id: request.id,
    result: {
      platform: 'mobile',
      version: `${Application.nativeApplicationVersion}/${Application.nativeBuildVersion}`,
      supportedMethods: supportedMethodsLinks.map(method => method.name),
    },
  });
}
