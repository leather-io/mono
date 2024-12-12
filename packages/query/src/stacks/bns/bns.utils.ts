import { BnsNamesOwnByAddressResponse } from '@stacks/stacks-blockchain-api-types';

import { NetworkModes } from '@leather.io/models';
import { isString, isUndefined } from '@leather.io/utils';

import { StacksClient } from '../stacks-client';
import { BnsV2Client } from './bns-v2-client';
import { getPrimaryName } from './bns-v2-sdk';

/**
 * Fetch names owned by an address.
 */
interface FetchNamesForAddressArgs {
  address: string;
  network: NetworkModes;
  signal: AbortSignal;
  client: BnsV2Client;
}

async function fetchPrimaryName(address: string, network: NetworkModes) {
  try {
    const res = await getPrimaryName({ address, network });
    return `${res?.name}.${res?.namespace}`;
  } catch {
    return;
  }
}

export async function fetchNamesForAddress({
  address,
  signal,
  network,
  client,
}: FetchNamesForAddressArgs): Promise<BnsNamesOwnByAddressResponse> {
  const res = await client.getNamesByAddress(address, signal);

  const namesResponse = res.names.map(name => name.full_name);

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

export async function fetchBtcNameOwner(
  client: BnsV2Client,
  bnsName: string
): Promise<string | null> {
  try {
    const zoneFileData = await client.getZoneFileData(bnsName);
    return zoneFileData.btc ?? null;
  } catch {
    // Name not found or invalid zonefile
    return null;
  }
}

// For stacks names we don't need to fetch the zonefile
export async function fetchStacksNameOwner(
  client: BnsV2Client,
  bnsName: string
): Promise<string | null> {
  try {
    const zoneFileData = await client.getBnsNameDataByName(bnsName);
    return zoneFileData.data.owner ?? null;
  } catch {
    // Name not found or invalid zonefile
    return null;
  }
}
