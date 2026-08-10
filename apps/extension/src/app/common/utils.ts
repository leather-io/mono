import { toUnicode } from 'punycode';

export function truncateString(str: string, maxLength: number) {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + '…';
}

export function abbreviateNumber(n: number) {
  if (n < 1e3) return n.toString();
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(2) + 'K';
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(2) + 'M';
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(2) + 'B';
  if (n >= 1e12) return +(n / 1e12).toFixed(2) + 'T';
  return n.toString();
}

export function getUrlHostname(url: string) {
  if (!url.startsWith('http')) return url;
  return new URL(url).hostname;
}

function getUrlPort(url: string) {
  return new URL(url).port;
}

export function addPortSuffix(url: string) {
  const port = getUrlPort(url);
  return port ? `:${port}` : '';
}

export function doesBrowserSupportWebUsbApi() {
  return Boolean((navigator as any).usb);
}

function isFullPage() {
  return document.location.pathname.startsWith('/index.html');
}

const pageMode = isFullPage() ? 'full' : 'popup';

type PageMode = 'popup' | 'full';

type WhenPageModeMap<T> = Record<PageMode, T>;

// don't use whenPageMode for styling - use panda responsive object
export function whenPageMode<T>(pageModeMap: WhenPageModeMap<T>) {
  return pageModeMap[pageMode];
}

export function isPopupMode() {
  return pageMode === 'popup';
}

export function parseIfValidPunycode(s: string) {
  try {
    return toUnicode(s);
  } catch {
    return s;
  }
}

export function capitalize(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

interface LinearInterpolation {
  start: number;
  end: number;
  t: number;
}

// Linear Interpolation
export function linearInterpolation({ start, end, t }: LinearInterpolation) {
  return (1 - t) * start + t * end;
}

export function removeMinusSign(value: string) {
  return value.replace('-', '');
}

export function serializeError(err: unknown) {
  if (err instanceof Error) {
    const errorObj: Record<string, any> = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };

    // Include any custom enumerable properties
    for (const key of Object.keys(err)) {
      errorObj[key] = (err as any)[key];
    }

    return errorObj;
  }

  return { message: String(err) };
}

interface CreateErrorArgs {
  name: string;
  message: string;
  [key: string]: unknown;
}
export function createError({ name, message, ...metadata }: CreateErrorArgs) {
  const err = new Error(message);
  err.name = name;
  Object.assign(err, metadata);
  if (Error.captureStackTrace) Error.captureStackTrace(err, createError);
  return err;
}

export function runOnce(fn: () => void) {
  let hasRun = false;
  return () => {
    if (!hasRun) {
      hasRun = true;
      fn();
    }
  };
}
