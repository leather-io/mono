import { injectable } from 'inversify';
import { values } from 'remeda';
import { z } from 'zod';

import {
  type StacksProtocol,
  type StacksProtocolAction,
  type StacksProtocolId,
  stacksProtocolActions,
} from '@leather.io/models';

import {
  LeatherApiClient,
  type LeatherApiProtocol,
} from '../infrastructure/api/leather/leather-api.client';

const stacksProtocolActionSchema = z.enum(stacksProtocolActions);

@injectable()
export class StacksProtocolService {
  constructor(private readonly leatherApiClient: LeatherApiClient) {}

  async getProtocols(signal?: AbortSignal): Promise<StacksProtocol[]> {
    const apiProtocols = await this.leatherApiClient.fetchProtocols({ signal });
    return values(apiProtocols).map(p => this.mapApiProtocol(p));
  }

  async getProtocolById(
    id: StacksProtocolId,
    signal?: AbortSignal
  ): Promise<StacksProtocol | null> {
    const apiProtocols = await this.leatherApiClient.fetchProtocols({ signal });
    const match = values(apiProtocols).find(p => p.id === id);
    return match ? this.mapApiProtocol(match) : null;
  }

  async getProtocolByAddress(
    address: string,
    signal?: AbortSignal
  ): Promise<StacksProtocol | null> {
    const apiProtocols = await this.leatherApiClient.fetchProtocols({ signal });
    const match = values(apiProtocols).find(p => p.addresses.includes(address));
    return match ? this.mapApiProtocol(match) : null;
  }

  async getContractActionType(
    protocolId: StacksProtocolId,
    contractName: string,
    functionName: string,
    signal?: AbortSignal
  ): Promise<StacksProtocolAction | null> {
    const contractMap = await this.leatherApiClient.fetchProtocolContracts(protocolId, { signal });
    const action = contractMap[contractName]?.[functionName];
    const parsedAction = stacksProtocolActionSchema.safeParse(action);
    return parsedAction.success ? parsedAction.data : null;
  }

  private mapApiProtocol(apiProtocol: LeatherApiProtocol): StacksProtocol {
    return {
      id: apiProtocol.id,
      name: apiProtocol.name,
      url: apiProtocol.url,
      logo: apiProtocol.logo,
      description: apiProtocol.description,
    };
  }
}
