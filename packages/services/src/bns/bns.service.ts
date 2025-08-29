import { standardPrincipalCV } from '@stacks/transactions';
import { injectable } from 'inversify';

import { BnsName, BnsProfile, bnsContractAddress, bnsContractName } from '@leather.io/models';

import { BnsV2ApiClient } from '../infrastructure/api/bns-v2/bns-v2-api.client';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { AccountRequest } from '../types';
import {
  buildBnsName,
  isValidBnsName,
  mapBnsNameFromV2ApiAddressName,
  mapBnsNameFromV2ApiName,
  mapBnsProfileDataFromZoneFile,
  parseBnsContractGetPrimaryResponseCV,
} from './bns.utils';

export interface AccountBnsName extends BnsName {
  isPrimary: boolean;
}

@injectable()
export class BnsService {
  constructor(
    private readonly bnsV2ApiClient: BnsV2ApiClient,
    private readonly stacksApiClient: HiroStacksApiClient
  ) {}

  public async getBnsName(fullName: string, signal?: AbortSignal): Promise<BnsName | null> {
    try {
      const bnsNameRes = await this.bnsV2ApiClient.fetchBnsName(fullName, { signal });
      return !bnsNameRes || !isValidBnsName(bnsNameRes)
        ? null
        : mapBnsNameFromV2ApiName(bnsNameRes.data);
    } catch {
      return null;
    }
  }

  public async getBnsProfile(fullName: string, signal?: AbortSignal): Promise<BnsProfile | null> {
    const bnsName = await this.getBnsName(fullName, signal);
    if (!bnsName) return null;

    try {
      const zoneFileRes = await this.bnsV2ApiClient.fetchBnsZoneFileRaw(fullName);
      return {
        bnsName,
        profileData: mapBnsProfileDataFromZoneFile(zoneFileRes.zonefile),
      };
    } catch {
      return { bnsName, profileData: {} };
    }
  }

  public async getAddressPrimaryBnsName(stacksAddress: string): Promise<BnsName | null> {
    const primaryName = await this.getPrimaryName(stacksAddress);
    return primaryName
      ? buildBnsName(stacksAddress, primaryName.name, primaryName.namespace)
      : null;
  }

  public async getAccountBnsNames(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<AccountBnsName[]> {
    if (!request.account.stacks?.stxAddress) {
      return [];
    }

    const [bnsV2ApiAddressNamesRes, primaryBnsName] = await Promise.all([
      this.bnsV2ApiClient.fetchAddressBnsNames(request.account.stacks.stxAddress, { signal }),
      this.getAddressPrimaryBnsName(request.account.stacks.stxAddress),
    ]);

    return bnsV2ApiAddressNamesRes.names.map(n => ({
      ...mapBnsNameFromV2ApiAddressName(n),
      isPrimary: !!primaryBnsName && n.full_name === primaryBnsName.fullName,
    }));
  }

  public async getAccountPrimaryBnsProfile(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<BnsProfile | null> {
    if (!request.account.stacks?.stxAddress) {
      return null;
    }
    const primaryName = await this.getAddressPrimaryBnsName(request.account.stacks.stxAddress);
    if (!primaryName) {
      return null;
    }
    try {
      const zoneFileRes = await this.bnsV2ApiClient.fetchBnsZoneFileRaw(primaryName?.fullName, {
        signal,
      });
      return {
        bnsName: primaryName,
        profileData: mapBnsProfileDataFromZoneFile(zoneFileRes.zonefile),
      };
    } catch {
      return { bnsName: primaryName, profileData: {} };
    }
  }

  private async getPrimaryName(stacksAddress: string, signal?: AbortSignal) {
    const res = await this.stacksApiClient.callReadOnlyFunction(
      {
        contractAddress: bnsContractAddress.mainnet,
        contractName: bnsContractName,
        functionName: 'get-primary',
        functionArgs: [standardPrincipalCV(stacksAddress)],
      },
      { signal }
    );
    return parseBnsContractGetPrimaryResponseCV(res);
  }
}
