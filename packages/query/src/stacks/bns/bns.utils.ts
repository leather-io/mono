import { parseZoneFile } from '@fungible-systems/zone-file';
import { BnsNamesOwnByAddressResponse } from '@stacks/stacks-blockchain-api-types';

import { isString, isUndefined } from '@leather.io/utils';

import { StacksClient } from '../stacks-client';

/**
 * Fetch names owned by an address.
 */
interface FetchNamesForAddressArgs {
  client: StacksClient;
  address: string;
  isTestnet: boolean;
  signal: AbortSignal;
}
export async function fetchNamesForAddress({
  client,
  address,
  isTestnet,
  signal,
}: FetchNamesForAddressArgs): Promise<BnsNamesOwnByAddressResponse> {
  const fetchFromApi = async () => {
    return client.getNamesOwnedByAddress(address, signal);
  };
  if (isTestnet) {
    return fetchFromApi();
  }

  const bnsNames = await fetchFromApi();

  const bnsName = 'names' in bnsNames ? bnsNames.names[0] : null;
  const names: string[] = [];
  if (bnsName) names.push(bnsName);

  return { names };
}

/**
 * Fetch the owner of a name.
 */
export async function fetchNameOwner(client: StacksClient, name: string, isTestnet: boolean) {
  const fetchFromApi = async () => {
    const res = await client.getNameInfo(name);
    if (isUndefined(res.address)) return null;
    if (!isString(res.address) || res.address.length === 0) return null;
    return res.address;
  };

  if (isTestnet) {
    return fetchFromApi();
  }

  return fetchFromApi();
}

/**
 * Fetch the zonefile-based BTC address for a specific name.
 * The BTC address is found via the `_btc._addr` TXT record,
 * as specified in https://www.newinternetlabs.com/blog/standardizing-names-for-bitcoin-addresses/
 *
 * The value returned from this function is not validated.
 */
export async function fetchBtcNameOwner(
  client: StacksClient,
  name: string
): Promise<string | null> {
  try {
    const nameResponse = await client.getNameInfo(name);
    const zonefile = parseZoneFile(nameResponse.zonefile);
    if (!zonefile.txt) return null;
    const btcRecord = zonefile.txt.find(record => record.name === '_btc._addr');
    if (isUndefined(btcRecord)) return null;
    const txtValue = btcRecord.txt;
    return isString(txtValue) ? txtValue : txtValue[0] ?? null;
  } catch (error) {
    // Name not found or invalid zonefile
    return null;
  }
}
