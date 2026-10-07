import { spamFilter } from '@leather.io/utils';

const whitelist = [
  'DOG.GO.TO.THE.MOON',
  'DOG.GO.TO.THE.MOON Transfer',
  'SUSDH.SUSDH.SUSDH.SUSDH',
  'SUSDH.SUSDH.SUSDH.SUSDH Transfer',
  'USDH.USDH.USDH.USDH',
  'USDH.USDH.USDH.USDH Transfer',
];

export function useSpamFilterWithWhitelist() {
  return (input: string) => spamFilter({ input, whitelist });
}
