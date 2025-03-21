import { useBnsV2Client } from '@/queries/stacks/bns/bns-v2-client';
import { useSettings } from '@/store/settings/settings';
import { useQuery } from '@tanstack/react-query';
import { toUnicode } from 'punycode';

import { bitcoinNetworkModeToCoreNetworkMode } from '@leather.io/bitcoin';
import { createGetBnsNamesOwnedByAddressQueryOptions } from '@leather.io/query';
import { truncateMiddle } from '@leather.io/utils';

// LEA-1826: Consciously duplicating from extension for convenience
function formatAccountName(input: string | undefined, maxLength = 20, offset = 4) {
  if (!input) return '';

  if (input.length > maxLength) {
    return truncateMiddle(input, offset);
  }
  return input;
}
function parseIfValidPunycode(s: string) {
  try {
    return toUnicode(s);
  } catch {
    return s;
  }
}

export function useAccountDisplayName({ address }: { address: string }) {
  const { networkPreference } = useSettings();
  const network = bitcoinNetworkModeToCoreNetworkMode(networkPreference.chain.bitcoin.mode);

  const client = useBnsV2Client();
  const query = useQuery({
    ...createGetBnsNamesOwnedByAddressQueryOptions({
      address,
      network,
      client,
    }),
    select: resp => {
      const names = resp.names ?? [];
      return parseIfValidPunycode(formatAccountName(names[0]));
    },
  });

  return {
    ...query,
    data: query.data,
  };
}
