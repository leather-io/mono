// Entry point for code that wants the catalog WITHOUT the React app — e.g.
// Playwright specs importing request payloads, so manual clicking and the
// automated suite send byte-identical requests. Nothing here touches `window`.
export { resolveParams, rpcCategories, rpcMethods } from './rpc-methods';
export type {
  ParamsBuilder,
  ParamsOf,
  RequestContext,
  RpcCategory,
  RpcMethodSpec,
  StaticParams,
} from './types';
export {
  type BtcAddressType,
  type FetchAddressesOptions,
  fetchAddresses,
  fetchBtcAddress,
  fetchNativeSegwitPubkey,
  fetchPolicyDescriptor,
  fetchStxAccount,
  pickBtcAddress,
  pickStxAccount,
  resolveBtcRecipient,
  resolveRegtestBtcRecipient,
  type StxAccount,
  type WalletAddress,
} from './wallet';
export {
  buildSelfSpendPsbtHex,
  type LockingScript,
  p2wpkhScript,
  type SelfSpendOptions,
  sortedMultiCosignDescriptor,
  sortedMultiScript,
  wshPkScript,
} from './wallet-psbt';
