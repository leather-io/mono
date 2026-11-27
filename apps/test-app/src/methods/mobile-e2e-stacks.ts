import { Cl, serializeCV } from '@stacks/transactions';

import {
  buildUnsignedMultisigStxTransferHex,
  buildUnsignedStxTransferHex,
} from '../builders/stx-tx';
import {
  SIP9_ASSET,
  SIP9_ASSET_ID,
  SIP10_ASSET,
  STX_COSIGNER_PUBLIC_KEYS,
  STX_RECIPIENT,
} from '../constants';
import { readString } from '../guards';
import { networkModeOf } from '../networks';
import { type ParamsOf, type RequestContext, type RpcMethodSpec, networkOf } from '../types';
import {
  hashStructuredMessage,
  hashUtf8Message,
  verifyBroadcastTransfer,
  verifyMessageSignature,
  verifyMultisigSignature,
  verifySingleSigSignature,
} from '../verifiers/mobile-e2e-stacks';
import { fetchStxAccount } from '../wallet';

const category = 'Mobile E2E';
const tags = ['mobile-e2e'];
const rejected = { error: 4001 };

const bnsContract = 'SP000000000000000000002Q6VF78.bns';
const testnetBuyContract = 'ST1X6M947Z7E58CNE0H8YJVJTVKS9VW0PHEG3NHN3.dull-sapphire-bird';
const testnetBuyArgs = ['010000000000000000000000000000002a'];
const testnetBuyPostCondition = '00021a8813c5086ddf53beada66744d40b1dcd0ac1d42001000000000000002a';
const signedMessage = 'test';
const transferAmount = 100;
const signTransactionAmount = 500n;

const tokenContract = `
(define-fungible-token connect-token)
(begin (ft-mint? connect-token u10000000 tx-sender))

(define-public (transfer
    (recipient principal)
    (amount uint)
  )
  (ok (ft-transfer? connect-token amount tx-sender recipient))
)

(define-public (faucet)
  (ok (ft-mint? connect-token u100 tx-sender))
)

(define-non-fungible-token hello-nft uint)
(begin (nft-mint? hello-nft u1 tx-sender))
(begin (nft-mint? hello-nft u2 tx-sender))
`;

const structuredMessage = serializeCV(
  Cl.tuple({ a: Cl.int(-1), b: Cl.stringUtf8('this is a structured message') })
);
const structuredDomain = serializeCV(
  Cl.tuple({
    name: Cl.stringAscii('leather.io'),
    version: Cl.stringAscii('1.0.0'),
    'chain-id': Cl.uint(1),
  })
);

function foreignSignerKey() {
  const [key] = STX_COSIGNER_PUBLIC_KEYS;
  if (!key) throw new Error('No STX co-signer public key configured');
  return key;
}

function unsignedSingleSigTransfer(ctx: RequestContext) {
  return buildUnsignedStxTransferHex({
    publicKey: foreignSignerKey(),
    recipient: STX_RECIPIENT,
    mode: networkModeOf(networkOf(ctx)),
    amount: signTransactionAmount,
  });
}

export const mobileE2eStacksMethods: RpcMethodSpec[] = [
  {
    id: 'mobile-e2e-stx-warm-addresses',
    method: 'getAddresses',
    label: 'e2e stx warm addresses',
    category,
    description: 'Caches the account keys so the builder cards below send one request.',
    params(ctx) {
      return { network: networkOf(ctx) };
    },
    expect: 'success',
    tags,
  },
  {
    id: 'mobile-e2e-stx-call-contract-bns',
    method: 'stx_callContract',
    label: 'e2e stx call bns',
    category,
    description: 'bns name-transfer with no post conditions, to be cancelled.',
    params: {
      contract: bnsContract,
      functionName: 'name-transfer',
      functionArgs: [
        Cl.bufferFromUtf8('id'),
        Cl.bufferFromUtf8('test'),
        Cl.standardPrincipal(STX_RECIPIENT),
        Cl.none(),
      ].map(argument => serializeCV(argument)),
    } satisfies ParamsOf<'stx_callContract'>,
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-call-contract-post-condition',
    method: 'stx_callContract',
    label: 'e2e stx call with post condition',
    category,
    description: 'Testnet buy call with one 42 µSTX post condition, to be cancelled.',
    params: {
      contract: testnetBuyContract,
      functionName: 'buy',
      functionArgs: testnetBuyArgs,
      network: 'testnet',
      postConditions: [testnetBuyPostCondition],
    } satisfies ParamsOf<'stx_callContract'>,
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-call-contract-allow-mode',
    method: 'stx_callContract',
    label: 'e2e stx call allow mode',
    category,
    description: 'Buy call in allow mode with no post conditions, to be cancelled.',
    params: {
      contract: testnetBuyContract,
      functionName: 'buy',
      functionArgs: testnetBuyArgs,
      postConditions: [],
      postConditionMode: 'allow',
    } satisfies ParamsOf<'stx_callContract'>,
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-deploy-contract',
    method: 'stx_deployContract',
    label: 'e2e stx deploy token',
    category,
    description: 'Deploys mock-contract-name with Clarity 3, to be cancelled.',
    params: {
      name: 'mock-contract-name',
      clarityCode: tokenContract,
      clarityVersion: 3,
    } satisfies ParamsOf<'stx_deployContract'>,
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-sign-message-utf8',
    method: 'stx_signMessage',
    label: 'e2e stx sign utf8 approve',
    category,
    description:
      'Signs the utf8 message "test"; the signature must recover to the returned key, which must be the account key. Needs the warm addresses card first.',
    params: { messageType: 'utf8', message: signedMessage } satisfies ParamsOf<'stx_signMessage'>,
    expect: 'success',
    tags,
    verify: verifyMessageSignature(params => {
      const message = readString(params, 'message');
      return message === undefined ? undefined : hashUtf8Message(message);
    }),
  },
  {
    id: 'mobile-e2e-stx-sign-message-structured',
    method: 'stx_signMessage',
    label: 'e2e stx sign structured',
    category,
    description:
      'Signs a SIP-018 tuple; the signature must recover to the account key. Needs the warm addresses card first.',
    params: {
      messageType: 'structured',
      message: structuredMessage,
      domain: structuredDomain,
    } satisfies ParamsOf<'stx_signMessage'>,
    expect: 'success',
    tags,
    verify: verifyMessageSignature(params => {
      const message = readString(params, 'message');
      const domain = readString(params, 'domain');
      return message === undefined || domain === undefined
        ? undefined
        : hashStructuredMessage(message, domain);
    }),
  },
  {
    id: 'mobile-e2e-stx-sign-message-reject',
    method: 'stx_signMessage',
    label: 'e2e stx sign utf8 reject',
    category,
    description: 'Signs the utf8 message "test", to be cancelled.',
    params: { messageType: 'utf8', message: signedMessage } satisfies ParamsOf<'stx_signMessage'>,
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-sign-transaction-multisig',
    method: 'stx_signTransaction',
    label: 'e2e stx sign multisig',
    category,
    description:
      'Unsigned 2-of-2 transfer of 500 µSTX from a co-signer and your key, sent as txHex. Needs the warm addresses card first.',
    async params(ctx) {
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        txHex: await buildUnsignedMultisigStxTransferHex({
          publicKeys: [foreignSignerKey(), publicKey],
          numSignatures: 2,
          recipient: STX_RECIPIENT,
          mode: networkModeOf(networkOf(ctx)),
          amount: signTransactionAmount,
        }),
        network: networkOf(ctx),
      };
    },
    expect: 'success',
    tags,
    verify: verifyMultisigSignature(),
  },
  {
    id: 'mobile-e2e-stx-sign-transaction-txhex-reject',
    method: 'stx_signTransaction',
    label: 'e2e stx sign txHex reject',
    category,
    description: 'Unsigned single-sig 500 µSTX transfer sent as txHex, to be cancelled.',
    async params(ctx) {
      return { txHex: await unsignedSingleSigTransfer(ctx), network: networkOf(ctx) };
    },
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-sign-transaction-sip30',
    method: 'stx_signTransaction',
    label: 'e2e stx sign sip30 approve',
    category,
    description:
      'Unsigned single-sig 500 µSTX transfer from your key, sent as transaction. The signed answer keeps recipient, amount, memo and nonce, and its signature recovers to the account key. Needs the warm addresses card first.',
    async params(ctx) {
      const { publicKey } = await fetchStxAccount(ctx);
      return {
        transaction: await buildUnsignedStxTransferHex({
          publicKey,
          recipient: STX_RECIPIENT,
          mode: networkModeOf(networkOf(ctx)),
          amount: signTransactionAmount,
        }),
      } satisfies ParamsOf<'stx_signTransaction'>;
    },
    expect: 'success',
    tags,
    verify: verifySingleSigSignature(),
  },
  {
    id: 'mobile-e2e-stx-transfer-sip10-reject',
    method: 'stx_transferSip10Ft',
    label: 'e2e stx sip10 reject',
    category,
    description: 'Transfers 1000 units of the SIP-10 asset, to be cancelled.',
    params: {
      recipient: STX_RECIPIENT,
      asset: SIP10_ASSET,
      amount: 1000,
    } satisfies ParamsOf<'stx_transferSip10Ft'>,
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-transfer-sip9-reject',
    method: 'stx_transferSip9Nft',
    label: 'e2e stx sip9 reject',
    category,
    description: 'Transfers the SIP-9 asset, to be cancelled.',
    params: {
      recipient: STX_RECIPIENT,
      asset: SIP9_ASSET,
      assetId: serializeCV(Cl.uint(SIP9_ASSET_ID)),
    } satisfies ParamsOf<'stx_transferSip9Nft'>,
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-transfer-memo-reject',
    method: 'stx_transferStx',
    label: 'e2e stx transfer memo reject',
    category,
    description: 'Transfers 100 µSTX with memo mock-memo, to be cancelled.',
    params: {
      recipient: STX_RECIPIENT,
      amount: transferAmount,
      memo: 'mock-memo',
    } satisfies ParamsOf<'stx_transferStx'>,
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-transfer-no-memo-reject',
    method: 'stx_transferStx',
    label: 'e2e stx transfer no memo reject',
    category,
    description: 'Transfers 100 µSTX without a memo, to be cancelled.',
    params: {
      recipient: STX_RECIPIENT,
      amount: transferAmount,
    } satisfies ParamsOf<'stx_transferStx'>,
    expect: rejected,
    tags,
  },
  {
    id: 'mobile-e2e-stx-transfer-approve',
    method: 'stx_transferStx',
    label: 'e2e stx transfer approve',
    category,
    description:
      'Transfers 100 µSTX; the returned transaction pays the requested recipient, amount and memo, is signed by the account key, and matches the txid. Needs the warm addresses card first.',
    params: {
      recipient: STX_RECIPIENT,
      amount: transferAmount,
    } satisfies ParamsOf<'stx_transferStx'>,
    expect: 'success',
    tags,
    verify: verifyBroadcastTransfer(),
  },
];
