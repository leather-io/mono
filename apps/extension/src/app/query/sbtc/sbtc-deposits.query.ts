import { hexToBytes } from '@stacks/common';
import { BytesReader, addressToString, deserializeAddress } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useConfigSbtc } from '../common/remote-config/remote-config.query';

export type SbtcStatus = 'pending' | 'accepted' | 'confirmed' | 'failed' | 'rbf';

export interface SbtcDeposit {
  amount: number;
  bitcoinTxOutputIndex: number;
  bitcoinTxid: string;
  depositScript: string;
  lastUpdateBlockHash: string;
  lastUpdateHeight: number;
  recipient: string; // Stacks address
  reclaimScript: string;
  status: SbtcStatus;
}

interface GetSbtcDepositsResponse {
  deposits: SbtcDeposit[];
  nextToken?: string;
}

async function getSbtcDeposits(apiUrl: string, status: string): Promise<GetSbtcDepositsResponse> {
  const resp = await axios.get(`${apiUrl}/deposit?status=${status}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return resp.data;
}

function useGetSbtcDeposits(stxAddress: string, status: string) {
  const { emilyApiUrl } = useConfigSbtc();
  return useQuery({
    queryKey: ['get-sbtc-deposits', emilyApiUrl, stxAddress, status],
    queryFn: () => getSbtcDeposits(emilyApiUrl, status),
    select: resp =>
      resp.deposits.filter(deposit => {
        const recipient = addressToString(
          deserializeAddress(new BytesReader(hexToBytes(deposit.recipient.slice(2))))
        );
        return recipient === stxAddress;
      }),
  });
}

export function useSbtcPendingDeposits(stxAddress: string) {
  const { data: pendingDeposits = [], isLoading: isLoadingStatusPending } = useGetSbtcDeposits(
    stxAddress,
    'pending'
  );
  const { data: acceptedDeposits = [], isLoading: isLoadingStatusAccepted } = useGetSbtcDeposits(
    stxAddress,
    'accepted'
  );

  return {
    isLoading: isLoadingStatusPending || isLoadingStatusAccepted,
    pendingSbtcDeposits: [...pendingDeposits, ...acceptedDeposits],
  };
}

export function useSbtcFailedDeposits(stxAddress: string) {
  const { data: failedSbtcDeposits = [], isLoading } = useGetSbtcDeposits(stxAddress, 'failed');

  return { isLoading, failedSbtcDeposits };
}
