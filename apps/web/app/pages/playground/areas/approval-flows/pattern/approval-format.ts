export const noFiatPrice = 'No price';

export function displayOrigin(origin: string) {
  const url = new URL(origin);
  if (url.protocol === 'https:') return url.host;
  return `${url.protocol}//${url.host}`;
}

const multiPartSuffixes = new Set([
  'co.uk',
  'org.uk',
  'ac.uk',
  'gov.uk',
  'com.au',
  'net.au',
  'org.au',
  'co.nz',
  'co.jp',
  'co.kr',
  'co.in',
  'co.za',
  'com.br',
  'com.cn',
  'com.hk',
  'com.mx',
  'com.sg',
  'github.io',
  'pages.dev',
  'vercel.app',
  'netlify.app',
  'workers.dev',
]);

const ipv4Pattern = /^\d{1,3}(\.\d{1,3}){3}$/;

interface OriginParts {
  scheme: string;
  subdomainLabels: string[];
  registrable: string;
}

function registrableLabelCount(labels: string[]) {
  const lastTwo = labels.slice(-2).join('.');
  return multiPartSuffixes.has(lastTwo) ? 3 : 2;
}

export function splitOrigin(origin: string): OriginParts {
  const url = new URL(origin);
  const scheme = url.protocol === 'https:' ? '' : `${url.protocol}//`;
  const port = url.port ? `:${url.port}` : '';
  const labels = url.hostname.split('.');
  const keep = registrableLabelCount(labels);
  if (ipv4Pattern.test(url.hostname) || url.hostname.startsWith('[') || labels.length <= keep) {
    return { scheme, subdomainLabels: [], registrable: url.host };
  }
  return {
    scheme,
    subdomainLabels: labels.slice(0, -keep),
    registrable: `${labels.slice(-keep).join('.')}${port}`,
  };
}

export function truncateMiddle(value: string, visible = 4) {
  if (value.length <= visible * 2 + 1) return value;
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}

export function splitTrailingZeros(amount: string) {
  const match = /^(.*\.\d*?)(0+)$/.exec(amount);
  if (!match) return { significant: amount, trailing: '' };
  const [, significant = amount, trailing = ''] = match;
  if (significant.endsWith('.'))
    return { significant: significant.slice(0, -1), trailing: `.${trailing}` };
  return { significant, trailing };
}

export function splitContractId(contractId: string) {
  const dotIndex = contractId.indexOf('.');
  if (dotIndex === -1) return { address: contractId, name: '' };
  return { address: contractId.slice(0, dotIndex), name: contractId.slice(dotIndex + 1) };
}

export function middleGroupStart(value: string, groupSize = 4) {
  const groupCount = Math.ceil(value.length / groupSize);
  return Math.floor((groupCount - 1) / 2) * groupSize;
}
