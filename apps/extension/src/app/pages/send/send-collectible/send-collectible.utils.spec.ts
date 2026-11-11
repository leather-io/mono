import { STACKS_MAINNET } from '@stacks/network';
import {
  Cl,
  type ContractCallPayload,
  NonFungibleConditionCode,
  PayloadType,
  PostConditionMode,
  PostConditionType,
  deserializeCV,
} from '@stacks/transactions';

import { generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import {
  createCollectibleTransferTxOptions,
  getCollectibleTransferBlockerMessage,
} from './send-collectible.utils';

const sender = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
const recipient = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const publicKey = '0250863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352';
const tokenId = 7;
const contractAddress = 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173';
const contractName = 'the-explorer-guild';

function createOptions() {
  return createCollectibleTransferTxOptions({
    asset: {
      chain: 'stacks',
      category: 'nft',
      protocol: 'sip9',
      assetId: `${contractAddress}.${contractName}::explorer`,
      contractId: `${contractAddress}.${contractName}`,
      tokenId,
      name: 'Explorer #7',
      description: '',
      content: { contentUrl: '', contentType: '' },
    },
    sender,
    publicKey,
    recipient,
    fee: createMoney(3000, 'STX'),
    nonce: 4,
    network: STACKS_MAINNET,
  });
}

describe(createCollectibleTransferTxOptions.name, () => {
  it('should call the SIP-009 transfer function with the token id, owner and recipient', () => {
    const options = createOptions();

    expect(options.contractAddress).toEqual(contractAddress);
    expect(options.contractName).toEqual(contractName);
    expect(options.functionName).toEqual('transfer');
    expect(options.functionArgs.map(arg => deserializeCV(arg))).toEqual([
      Cl.uint(tokenId),
      Cl.principal(sender),
      Cl.principal(recipient),
    ]);
  });

  it('should build a deny-mode transaction with an NFT post-condition on the token', async () => {
    const tx = await generateStacksUnsignedTransaction(createOptions());
    const payload: ContractCallPayload | undefined =
      tx.payload.payloadType === PayloadType.ContractCall ? tx.payload : undefined;

    expect(payload?.functionName.content).toEqual('transfer');
    expect(tx.postConditionMode).toEqual(PostConditionMode.Deny);
    expect(tx.postConditions.values).toHaveLength(1);
    expect(tx.postConditions.values[0]).toMatchObject({
      conditionType: PostConditionType.NonFungible,
      conditionCode: NonFungibleConditionCode.Sends,
      assetName: Cl.uint(tokenId),
    });
  });
});

describe(getCollectibleTransferBlockerMessage.name, () => {
  it('should explain that the contract has no standard transfer', () => {
    expect(getCollectibleTransferBlockerMessage('unsupported-contract')).toContain('SIP-009');
  });

  it('should explain that a managed namespace controls transfers', () => {
    expect(getCollectibleTransferBlockerMessage('managed-namespace')).toContain(
      'namespace manager'
    );
  });

  it('should explain that a listed name must be unlisted first', () => {
    expect(getCollectibleTransferBlockerMessage('listed')).toContain('listed for sale');
  });
});
