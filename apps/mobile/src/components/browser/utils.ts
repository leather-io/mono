export function formatURL(url: string) {
  if (url.startsWith('http')) {
    return url;
  }
  return 'https://' + url;
}

export enum BrowserType {
  inactive = 'inactive',
  active = 'active',
}
