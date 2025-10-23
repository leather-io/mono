import { injectable } from 'inversify';

import {
  CalculateMaxSpendResponse,
  CoinSelectionOutput,
  CoinSelectionRecipient,
  calculateMaxSpend,
  determineUtxosForSpend,
  determineUtxosForSpendAll,
} from '@leather.io/bitcoin';
import { Money, OwnedUtxo } from '@leather.io/models';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { AccountRequest } from '../types';
import { UtxosService } from '../utxos/utxos.service';

export interface CalculateMaxSpendRequest {
  account: AccountRequest;
  recipient: string;
  feeRate?: number;
}

export interface CoinSelectionRequest {
  account: AccountRequest;
  recipients: CoinSelectionRecipient[];
  feeRate?: number;
  isMaxSpend?: boolean;
}

export interface CoinSelectionResult {
  inputs: OwnedUtxo[];
  outputs: CoinSelectionOutput[];
  estimatedTxSize: number;
  fee: Money;
}

@injectable()
export class BitcoinCoinSelectionService {
  constructor(
    private readonly utxosService: UtxosService,
    private readonly leatherApiClient: LeatherApiClient
  ) {}

  async performCoinSelection(
    { account, recipients, feeRate, isMaxSpend }: CoinSelectionRequest,
    signal?: AbortSignal
  ): Promise<CoinSelectionResult> {
    const { available: availableInputUtxos } = await this.utxosService.getAccountUtxos(
      account,
      signal
    );
    if (!feeRate) {
      const feeRates = await this.leatherApiClient.fetchBitcoinFeeRates({ signal });
      feeRate = feeRates.standard.rate;
    }
    const result = isMaxSpend
      ? determineUtxosForSpendAll({ feeRate, recipients, utxos: availableInputUtxos })
      : determineUtxosForSpend({ feeRate, recipients, utxos: availableInputUtxos });
    return {
      inputs: result.inputs,
      outputs: result.outputs,
      estimatedTxSize: result.size,
      fee: result.fee,
    };
  }

  async calculateMaxSpend(
    { account, recipient, feeRate }: CalculateMaxSpendRequest,
    signal?: AbortSignal
  ): Promise<CalculateMaxSpendResponse> {
    const utxos = await this.utxosService.getAccountUtxos(account, signal);
    if (!feeRate) {
      const feeRates = await this.leatherApiClient.fetchBitcoinFeeRates({ signal });
      feeRate = feeRates.standard.rate;
    }
    return calculateMaxSpend({
      recipient: recipient,
      utxos: utxos.available,
      feeRate,
    });
  }
}
