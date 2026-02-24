import {
  ContractCallTransaction,
  MempoolContractCallTransaction,
  MempoolSmartContractTransaction,
  SmartContractTransaction,
  TokenTransferTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { describe, expect, it } from 'vitest';

import { stxAsset } from '@leather.io/constants';
import { AccountAddresses, BlockchainActivityEvent } from '@leather.io/models';
import { createMoney, initBigNumber } from '@leather.io/utils';

import {
  mapStacksContractCall,
  mapStacksSmartContractDeploy,
  mapStacksTokenTransfer,
} from './stacks-blockchain-activity.utils';

const account: AccountAddresses = {
  id: { fingerprint: 'abc', accountIndex: 0 },
  stacks: { stxAddress: 'ST1SENDER' },
};

const confirmedTxProps = {
  tx_id: '0xabc',
  fee_rate: '2000',
  tx_status: 'success' as const,
  block_time: 1700000000,
  burn_block_time: 1700000000,
  block_height: 100,
};

describe('mapStacksTokenTransfer', () => {
  it('maps a sent token transfer', () => {
    const tx = {
      ...confirmedTxProps,
      tx_type: 'token_transfer',
      sender_address: 'ST1SENDER',
      token_transfer: { amount: '5000000', recipient_address: 'ST2RECIPIENT' },
    } as unknown as TokenTransferTransaction;

    const result = mapStacksTokenTransfer(tx, account);

    expect(result.chain).toBe('stacks');
    expect(result.txid).toBe('0xabc');
    expect(result.status).toBe('success');
    expect(result.blockHeight).toBe(100);
    expect(result.initiatedByUser).toBe(true);
    expect(result.fee?.amount.toString()).toBe('2000');
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      action: 'sent',
      asset: stxAsset,
      counterparty: 'ST2RECIPIENT',
    });
    expect(result.events[0].amount.crypto.amount.toString()).toBe('5000000');
  });

  it('maps a received token transfer', () => {
    const tx = {
      ...confirmedTxProps,
      tx_type: 'token_transfer',
      sender_address: 'ST2OTHER',
      token_transfer: { amount: '3000000', recipient_address: 'ST1SENDER' },
    } as unknown as TokenTransferTransaction;

    const result = mapStacksTokenTransfer(tx, account);

    expect(result.initiatedByUser).toBe(false);
    expect(result.events[0]).toMatchObject({
      action: 'received',
      counterparty: 'ST2OTHER',
    });
  });
});

describe('mapStacksContractCall', () => {
  it('maps a contract call with protocol info and events', () => {
    const tx = {
      ...confirmedTxProps,
      tx_type: 'contract_call',
      sender_address: 'ST1SENDER',
      contract_call: {
        contract_id: 'SP123.swap-router',
        function_name: 'swap',
      },
    } as unknown as ContractCallTransaction;

    const events: BlockchainActivityEvent[] = [
      {
        action: 'sent',
        asset: stxAsset,
        counterparty: 'SP123.pool',
        amount: {
          crypto: createMoney(initBigNumber('1000'), 'STX'),
          quote: createMoney(0, 'USD'),
        },
      },
    ];

    const result = mapStacksContractCall(tx, account, events, {
      protocol: 'bitflow',
      action: 'swap',
    });

    expect(result.contract).toEqual({
      type: 'call',
      contractId: 'SP123.swap-router',
      functionName: 'swap',
      protocol: 'bitflow',
      action: 'swap',
    });
    expect(result.events).toBe(events);
    expect(result.initiatedByUser).toBe(true);
  });

  it('maps a contract call initiated by another address', () => {
    const tx = {
      ...confirmedTxProps,
      sender_address: 'ST_OTHER',
      contract_call: {
        contract_id: 'SP123.contract',
        function_name: 'callback',
      },
    } as unknown as ContractCallTransaction;

    const result = mapStacksContractCall(tx, account, [], {});

    expect(result.initiatedByUser).toBe(false);
    expect(result.contract).toMatchObject({
      type: 'call',
      protocol: undefined,
      action: undefined,
    });
  });

  it('handles mempool contract call', () => {
    const tx = {
      tx_id: '0xpending',
      fee_rate: '500',
      tx_status: 'pending',
      receipt_time: 1700000001,
      sender_address: 'ST1SENDER',
      contract_call: {
        contract_id: 'SP123.contract',
        function_name: 'transfer',
      },
    } as unknown as MempoolContractCallTransaction;

    const result = mapStacksContractCall(tx, account, [], {});

    expect(result.status).toBe('pending');
    expect(result.blockHeight).toBeUndefined();
    expect(result.timestamp).toBe(1700000001);
  });
});

describe('mapStacksSmartContractDeploy', () => {
  it('maps a deploy when sender matches account', () => {
    const tx = {
      ...confirmedTxProps,
      sender_address: 'ST1SENDER',
      smart_contract: { contract_id: 'ST1SENDER.my-contract' },
    } as unknown as SmartContractTransaction;

    const events: BlockchainActivityEvent[] = [
      {
        action: 'minted',
        asset: stxAsset,
        amount: {
          crypto: createMoney(initBigNumber('100'), 'STX'),
          quote: createMoney(0, 'USD'),
        },
      },
    ];

    const result = mapStacksSmartContractDeploy(tx, account, events);

    expect(result).toBeDefined();
    expect(result!.initiatedByUser).toBe(true);
    expect(result!.contract).toEqual({
      type: 'deploy',
      contractId: 'ST1SENDER.my-contract',
    });
    expect(result!.events).toBe(events);
  });

  it('returns undefined when sender does not match account', () => {
    const tx = {
      ...confirmedTxProps,
      sender_address: 'ST_OTHER',
      smart_contract: { contract_id: 'ST_OTHER.their-contract' },
    } as unknown as SmartContractTransaction;

    const result = mapStacksSmartContractDeploy(tx, account, []);

    expect(result).toBeUndefined();
  });

  it('handles mempool deploy', () => {
    const tx = {
      tx_id: '0xpending',
      fee_rate: '1000',
      tx_status: 'pending',
      receipt_time: 1700000002,
      sender_address: 'ST1SENDER',
      smart_contract: { contract_id: 'ST1SENDER.pending-contract' },
    } as unknown as MempoolSmartContractTransaction;

    const result = mapStacksSmartContractDeploy(tx, account, []);

    expect(result).toBeDefined();
    expect(result!.status).toBe('pending');
    expect(result!.blockHeight).toBeUndefined();
  });
});
