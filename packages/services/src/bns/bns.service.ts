import { ClarityType, standardPrincipalCV, uintCV } from '@stacks/transactions';
import { inject, injectable } from 'inversify';

import { BnsName, BnsProfile, bnsContractAddress, bnsContractName } from '@leather.io/models';

import { BnsV2ApiClient } from '../infrastructure/api/bns-v2/bns-v2-api.client';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { selectStacksNetworkMode } from '../infrastructure/settings/settings.selectors';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { AccountRequest } from '../types';
import {
  buildBnsName,
  getBnsNamespaceCVFromGetBnsFromIdResponseCV,
  isManagerTransferableNamespaceResponseCV,
  isValidBnsName,
  mapBnsNameFromV2ApiAddressName,
  mapBnsNameFromV2ApiName,
  mapBnsProfileDataFromZoneFile,
  parseBnsContractGetPrimaryResponseCV,
} from './bns.utils';

export type BnsNameTransferBlocker = 'managed-namespace' | 'listed';

export interface AccountBnsName extends BnsName {
  isPrimary: boolean;
}

@injectable()
export class BnsService {
  constructor(
    private readonly bnsV2ApiClient: BnsV2ApiClient,
    private readonly stacksApiClient: HiroStacksApiClient,
    @inject(Types.SettingsService) private readonly settings: SettingsService
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

  public async getAddressPrimaryBnsName(
    stacksAddress: string,
    signal?: AbortSignal
  ): Promise<BnsName | null> {
    try {
      const primaryName = await this.getPrimaryName(stacksAddress, signal);
      return primaryName
        ? buildBnsName(stacksAddress, primaryName.name, primaryName.namespace)
        : null;
    } catch {
      return null;
    }
  }

  public async getAccountBnsNames(
    request: AccountRequest,
    signal?: AbortSignal
  ): Promise<AccountBnsName[]> {
    const stxAddress = request.account.stacks?.stxAddress;
    if (!stxAddress) {
      return [];
    }

    const namesResPromise = this.bnsV2ApiClient
      .fetchAddressBnsNames(stxAddress, { signal })
      .catch(() =>
        this.bnsV2ApiClient.fetchAddressBnsNames(stxAddress, { signal, skipCache: true })
      );

    const [bnsV2ApiAddressNamesRes, primaryBnsName] = await Promise.all([
      namesResPromise.catch(() => null),
      this.getAddressPrimaryBnsName(stxAddress, signal),
    ]);

    if (!bnsV2ApiAddressNamesRes) return [];

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
    const primaryName = await this.getAddressPrimaryBnsName(
      request.account.stacks.stxAddress,
      signal
    );
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

  public async getBnsNameTransferBlocker(
    tokenId: number,
    signal?: AbortSignal
  ): Promise<BnsNameTransferBlocker | null> {
    const contract = {
      contractAddress: bnsContractAddress[selectStacksNetworkMode(this.settings.getSettings())],
      contractName: bnsContractName,
    };
    const options = { signal, skipCache: true };
    const [bnsFromIdRes, marketEntry] = await Promise.all([
      this.stacksApiClient.callReadOnlyFunction(
        { ...contract, functionName: 'get-bns-from-id', functionArgs: [uintCV(tokenId)] },
        options
      ),
      this.stacksApiClient.getMapEntry(
        { ...contract, mapName: 'market', key: uintCV(tokenId) },
        options
      ),
    ]);
    const namespacePropertiesRes = await this.stacksApiClient.callReadOnlyFunction(
      {
        ...contract,
        functionName: 'get-namespace-properties',
        functionArgs: [getBnsNamespaceCVFromGetBnsFromIdResponseCV(bnsFromIdRes)],
      },
      options
    );
    if (isManagerTransferableNamespaceResponseCV(namespacePropertiesRes)) {
      return 'managed-namespace';
    }
    if (marketEntry.type === ClarityType.OptionalSome) return 'listed';
    return null;
  }

  private async getPrimaryName(stacksAddress: string, signal?: AbortSignal) {
    const res = await this.stacksApiClient.callReadOnlyFunction(
      {
        contractAddress: bnsContractAddress[selectStacksNetworkMode(this.settings.getSettings())],
        contractName: bnsContractName,
        functionName: 'get-primary',
        functionArgs: [standardPrincipalCV(stacksAddress)],
      },
      { signal }
    );
    return parseBnsContractGetPrimaryResponseCV(res);
  }
}
