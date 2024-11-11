import { parseZoneFile } from '@fungible-systems/zone-file';
import { BnsNamesOwnByAddressResponse } from '@stacks/stacks-blockchain-api-types';
import axios from 'axios';
import { z } from 'zod';

import { BNS_V2_API_BASE_URL, NetworkModes } from '@leather.io/models';
import { isString, isUndefined } from '@leather.io/utils';

import { StacksClient } from '../stacks-client';
import { getPrimaryName } from './bns-v2-sdk';
import { bnsV2NamesByAddressSchema } from './bns.schemas';

/**
 * Fetch names owned by an address.
 */
interface FetchNamesForAddressArgs {
  address: string;
  network: NetworkModes;
  signal: AbortSignal;
}

type BnsV2NamesByAddressResponse = z.infer<typeof bnsV2NamesByAddressSchema>;

async function fetchPrimaryName(address: string, network: NetworkModes) {
  try {
    const res = await getPrimaryName({ address, network });
    return `${res?.name}.${res?.namespace}`;
  } catch (error) {
    // Ignore error
    return undefined;
  }
}

export async function fetchNamesForAddress({
  address,
  signal,
  network,
}: FetchNamesForAddressArgs): Promise<BnsNamesOwnByAddressResponse> {
  const res = await axios.get<BnsV2NamesByAddressResponse>(
    `${BNS_V2_API_BASE_URL}/names/address/${address}/valid`,
    { signal }
  );

  const namesResponse = res.data.names.map(name => name.full_name);

  // If the address owns multiple names, we need to fetch the primary name from SDK
  let primaryName: string | undefined;
  if (namesResponse.length > 1) {
    primaryName = await fetchPrimaryName(address, network);
  }

  const names = [];

  // Put the primary name first
  if (primaryName) {
    names.push(primaryName);
  }

  // Add the rest of the names and filter out the primary name
  names.push(...namesResponse.filter(name => name !== primaryName));

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
    return isString(txtValue) ? txtValue : (txtValue[0] ?? null);
  } catch (error) {
    // Name not found or invalid zonefile
    return null;
  }
}
