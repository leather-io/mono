import { stacksAddressRank } from './account-funding';
import { sbtcAssetId, sbtcPrincipal } from './sip10';

export const externalStacksAddress = 'SPWECF3XYVRBRCN23CJJCX9XKSF8RFWQPAQMWXT';

const fundedStxBalance = 13568037;
const microStxPerRank = 1000000;

export function fundedStxBalanceOf(address: string) {
  return String(fundedStxBalance + stacksAddressRank(address) * microStxPerRank);
}

const receiveStxTxid = '0xae98b9512a5a196ea0f1566101d21a6e7230ff822489fc42920c9cfb5d3b0c1c';
const sendStxTxid = '0x5c2b4b0b3d1a8a3f6e1f0c9d8b7a6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a99';
const receiveSbtcTxid = '0x7d1e3f5a9b2c4d6e8f0a1b3c5d7e9f1a2b4c6d8e0f1a3b5c7d9e1f2a4b6c8d0e';

const receiveStxAmount = '15000000';
const sendStxAmount = '1000000';
const sendStxFee = '431963';
const receiveSbtcAmount = '10000000';

const blockHeight = 180000;
const blockTime = 1730000000;

interface TxTiming {
  height: number;
  time: number;
  index: number;
}

interface StxBalanceChange {
  sent: string;
  received: string;
}

function principalTxBase(txid: string, sender: string, nonce: number, fee: string, at: TxTiming) {
  return {
    tx_id: txid,
    sender: { address: sender, nonce },
    sponsor: null,
    fee_rate: fee,
    block: {
      height: at.height,
      hash: `0x${String(at.height).padStart(64, '0')}`,
      index_hash: `0x${String(at.height).padStart(64, '1')}`,
      time: at.time,
      tx_index: at.index,
    },
    bitcoin_block: { height: 870000 + at.index, time: at.time - 60 },
    status: 'success',
  };
}

function principalTxResult(
  transaction: ReturnType<typeof principalTxBase>,
  involvement: 'sender' | 'affected',
  stx: StxBalanceChange,
  ft: boolean
) {
  return {
    transaction,
    involvement,
    balance_changes: {
      stx: {
        ...stx,
        net: String(Number(stx.received) - Number(stx.sent)),
      },
    },
    affected_balances: { stx: stx.sent !== '0' || stx.received !== '0', ft, nft: false },
  };
}

function tokenTransferTx(
  txid: string,
  sender: string,
  recipient: string,
  amount: string,
  nonce: number,
  at: TxTiming
) {
  return {
    ...principalTxBase(txid, sender, nonce, sendStxFee, at),
    type: 'token_transfer',
    token_transfer: { recipient, amount, memo: null },
  };
}

function sbtcTransferTx(sender: string, at: TxTiming) {
  return {
    ...principalTxBase(receiveSbtcTxid, sender, 7, '3000', at),
    type: 'contract_call',
    contract_call: { contract_id: sbtcPrincipal, function_name: 'transfer' },
  };
}

const receiveStxAt = { height: blockHeight, time: blockTime, index: 1 };
const sendStxAt = { height: blockHeight + 100, time: blockTime + 86400, index: 2 };
const receiveSbtcAt = { height: blockHeight + 200, time: blockTime + 2 * 86400, index: 3 };

export function fundedPrincipalTransactions(address: string) {
  return [
    principalTxResult(
      sbtcTransferTx(externalStacksAddress, receiveSbtcAt),
      'affected',
      { sent: '0', received: '0' },
      true
    ),
    principalTxResult(
      tokenTransferTx(sendStxTxid, address, externalStacksAddress, sendStxAmount, 0, sendStxAt),
      'sender',
      { sent: String(Number(sendStxAmount) + Number(sendStxFee)), received: '0' },
      false
    ),
    principalTxResult(
      tokenTransferTx(
        receiveStxTxid,
        externalStacksAddress,
        address,
        receiveStxAmount,
        15,
        receiveStxAt
      ),
      'affected',
      { sent: '0', received: receiveStxAmount },
      false
    ),
  ];
}

const fundedFtBalanceChanges = [
  {
    tx_id: receiveSbtcTxid,
    asset: { type: 'ft', identifier: sbtcAssetId },
    balance_change: { sent: '0', received: receiveSbtcAmount, net: receiveSbtcAmount },
  },
];

export function fundedBalanceChanges(txIds: string[]) {
  return fundedFtBalanceChanges.filter(change => txIds.includes(change.tx_id));
}

export function stxBalance(balance: string) {
  return { balance, available: balance, locked: null, mempool: null };
}

export function cursorPage<T>(results: T[]) {
  return {
    limit: 50,
    total: results.length,
    cursor: { next: null, previous: null, current: null },
    results,
  };
}

export function accountNonces(nextNonce: number) {
  return {
    next_nonce: nextNonce,
    last_confirmed_nonce: nextNonce > 0 ? nextNonce - 1 : null,
    last_mempool_tx_nonce: null,
    possible_next_nonce: nextNonce,
    detected_missing_nonces: [],
    detected_mempool_nonces: [],
    mempool: { last_nonce: null, pending_nonces: [], missing_nonces: [] },
  };
}

export const fundedNextNonce = 1;

export const stacksFeeEstimate = {
  estimated_cost: { write_length: 0, write_count: 0, read_length: 0, read_count: 0, runtime: 0 },
  estimated_cost_scalar: 6,
  estimations: [
    { fee_rate: 35.99908181950457, fee: 200 },
    { fee_rate: 382.0532104229179, fee: 400 },
    { fee_rate: 65987.51710815083, fee: 901 },
  ],
  cost_scalar_change_by_byte: 0.00476837158203125,
};

export function pendingStxTransfer(address: string) {
  return {
    tx_id: '0x2fd347fd2f775db6bec23e566a1d1d4914f10502f6a0d44692e93aa80cf047e4',
    sender: { address, nonce: fundedNextNonce },
    sponsor: null,
    fee_rate: '3000',
    receipt_time: blockTime + 3 * 86400,
    receipt_time_iso: new Date((blockTime + 3 * 86400) * 1000).toISOString(),
    receipt_block_height: blockHeight + 300,
    status: 'pending',
    replaced_by_tx_id: null,
    type: 'token_transfer',
    token_transfer: { recipient: externalStacksAddress, amount: '1000000', memo: null },
  };
}

const nftAssetIdentifier =
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.leather-e2e-nft::leather-e2e-nft';

export const nftHoldings = [
  {
    asset_identifier: nftAssetIdentifier,
    value: { hex: '0x0100000000000000000000000000000001', repr: 'u1' },
  },
];

export const nftMetadata = {
  sip: 16,
  name: 'Leather E2E NFT #1',
  description: 'A collectible served by the e2e mocks',
  image: 'https://images.leather.io/tokens/sbtc.svg',
  cached_image: 'https://images.leather.io/tokens/sbtc.svg',
  cached_thumbnail_image: 'https://images.leather.io/tokens/sbtc.svg',
  attributes: [],
  properties: {},
};

export const sip10TransferInterface = {
  functions: [
    {
      name: 'transfer',
      access: 'public',
      args: [
        { name: 'amount', type: 'uint128' },
        { name: 'sender', type: 'principal' },
        { name: 'recipient', type: 'principal' },
        { name: 'memo', type: { optional: { buffer: { length: 34 } } } },
      ],
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
  ],
  variables: [],
  maps: [],
  fungible_tokens: [{ name: 'sbtc-token' }],
  non_fungible_tokens: [],
  epoch: 'Epoch30',
  clarity_version: 'Clarity3',
};
