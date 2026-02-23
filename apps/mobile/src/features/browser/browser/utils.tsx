import { ComponentProps, RefObject } from 'react';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { App } from '@/store/apps/utils';
import { getDappMap } from '@/utils/dapps';
import * as Application from 'expo-application';
import { File, Paths } from 'expo-file-system';

import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  endpoints,
  getInfo,
  supportedMethods,
} from '@leather.io/rpc';
import { Favicon } from '@leather.io/ui/native';

const bareUrlRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function formatURL(url: string) {
  if (url.startsWith('http')) {
    return url;
  }
  if (bareUrlRegex.test(url)) {
    return 'https://' + url;
  }
  return 'https://duckduckgo.com/?q=' + url;
}

export function isValidUrl(testUrl: string) {
  let url;

  try {
    url = new URL(formatURL(testUrl));
  } catch {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}

function getScreenshotFile(hostname: string) {
  return new File(Paths.document, `${hostname}_screenshot.jpg`);
}
// Capture screenshot using react-native-view-shot
export async function captureScreenshot(viewShotRef: RefObject<ViewShot | null>, hostname: string) {
  if (!viewShotRef.current) return;

  try {
    // For some reason on iOS we can't read a tmpfile, we need to use b64 here
    const tmpFileUri = await captureRef(viewShotRef, {
      format: 'png',
      quality: 0.6,
      width: 300,
      height: 600,
      result: 'tmpfile',
    });

    const tmpFile = new File(tmpFileUri);
    const screenshotFile = getScreenshotFile(hostname);

    if (screenshotFile.exists) {
      screenshotFile.delete();
    }

    tmpFile.copy(screenshotFile);

    return screenshotFile.uri;
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

function getParentHostname(url: string) {
  const hostname = new URL(url).hostname;
  const separatedHostname = hostname.split('.');
  return [
    separatedHostname[separatedHostname.length - 2],
    separatedHostname[separatedHostname.length - 1],
  ].join('.');
}

export function getAppDetails(
  app: App,
  { iconSize }: { iconSize: ComponentProps<typeof Favicon>['size'] }
) {
  const predefinedDappMap = getDappMap();
  const matchedHostname = Object.values(predefinedDappMap).find(predefinedDapp => {
    const predefinedDappHostname = getParentHostname(predefinedDapp.url);
    const appHostname = getParentHostname(app.origin);
    return predefinedDappHostname === appHostname;
  });
  const icon = matchedHostname ? (
    <matchedHostname.icon variant={iconSize === 16 ? 'small' : 'medium'} />
  ) : (
    <Favicon origin={getParentHostname(app.origin)} size={iconSize} />
  );
  const name = matchedHostname ? matchedHostname.title : app.name;

  return { name, icon };
}
