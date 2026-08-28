// Entry point for code that wants the catalog WITHOUT the React app — e.g.
// Playwright specs importing request payloads, so manual clicking and the
// automated suite send byte-identical requests. Nothing here touches `window`.
export {
  findSpec,
  resolveParams,
  rpcCategories,
  rpcMethods,
  rpcTags,
  specsWithTag,
} from './rpc-methods';

//
// Request families declared as choices rather than as entries.
export {
  type BuilderField,
  type BuilderFieldValue,
  type BuilderOption,
  type BuilderSelection,
  type SpecBuilder,
  buildFromSelection,
  builderSpecId,
  normalizeSelection,
  parseBuilderSpecId,
  visibleFields,
} from './builders/spec-builder';
export {
  buildSpec,
  builderCombinationSpecs,
  findBuilder,
  findBuilderSpec,
  specBuilders,
} from './methods/builders';
export {
  expectationFor,
  isParamsBuilder,
  networkOf,
  type Expectation,
  type PlatformOutcomes,
  type ScenarioStepArgs,
  type ScenarioState,
  type VerifyArgs,
  type NetworkMode,
  type Outcome,
  type ParamsBuilder,
  type ParamsOf,
  type Platform,
  type RequestContext,
  type Requirement,
  type RpcCategory,
  type RpcMethodSpec,
  type Scenario,
  type ScenarioStep,
  type ScenarioStepResult,
  type StaticParams,
  type VerifyCheck,
  type VerifyReport,
  type Verifier,
} from './types';
export { type SighashFlag, SIGHASH, SIGHASH_NAMES } from './constants';
export {
  type WalletNetwork,
  defaultNetworkId,
  isMainnet,
  networkModeOf,
  walletNetworks,
} from './networks';
export {
  type AccountKeys,
  type AccountSummary,
  type BtcAddressType,
  type FetchAddressesOptions,
  type GetAddressesChain,
  type TaprootKeys,
  type StxAccount,
  type WalletAddress,
  extractXpub,
  fetchAccountKeys,
  fetchAccountSummary,
  fetchAddresses,
  fetchBtcAddress,
  fetchNativeSegwitPubkey,
  fetchPolicyDescriptor,
  fetchStxAccount,
  fetchTaprootKeys,
  pickBtcAddress,
  pickBtcEntry,
  pickStxAccount,
  resolveBtcRecipient,
  resolveOwnBtcRecipient,
} from './wallet';

//
// Builders — pure payload construction, unit-tested next to the source.
export {
  type BondDescriptorArgs,
  type CompiledDescriptor,
  type SortedMultiDescriptorArgs,
  bondDescriptorFor,
  bondHash,
  compileDescriptor,
  cosignerXpubsFor,
  legacyRawPubkeyDescriptor,
  sortedMultiDescriptor,
} from './builders/descriptors';
export { type CollectKeysOptions, collectPsbtKeys } from './builders/keys';
export {
  type LockingScript,
  type PsbtInputConfig,
  type PsbtInputKind,
  type PsbtKeys,
  type PsbtOutputConfig,
  type PsbtOutputKind,
  type PsbtScenarioInput,
  type PsbtScenario,
  type PsbtScenarioConfig,
  type SelfSpendOptions,
  buildPsbtScenario,
  buildSelfSpendPsbtHex,
  descriptorScript,
  deriveVaultKey,
  foreignScript,
  p2trScript,
  p2wpkhScript,
  wshPkScript,
} from './builders/psbt';
export {
  type UnsignedContractCallArgs,
  type UnsignedMultisigStxTransferArgs,
  type UnsignedStxTransferArgs,
  buildUnsignedContractCallHex,
  buildUnsignedMultisigStxTransferHex,
  buildUnsignedStxTransferHex,
  stacksNetworkFor,
} from './builders/stx-tx';
export {
  type StakingChain,
  type StakingContext,
  allowContractCallerParams,
  claimRewardsParams,
  delegateStxParams,
  revokeDelegateStxParams,
  stakeParams,
  stakeUpdateParams,
  stakingChainFor,
  unstakeParams,
} from './builders/staking';
export {
  type ClaimStakerRewardsArgs,
  type ContractIdParts,
  type Pox5CallContractParams,
  type Pox5PayoutPreference,
  type StakeArgs,
  type StakeUpdateArgs,
  type UnstakeArgs,
  POX5_MAX_NUM_CYCLES,
  encodeSignerCalldata,
  getClaimStakerRewardsOptions,
  getStakeOptions,
  getStakeUpdateOptions,
  getUnstakeOptions,
  parseContractId,
} from './builders/pox5';

//
// Verifiers — assertions a spec or a spec runner can make about a response.
export {
  type DecodedPsbt,
  type DecodedPsbtInput,
  type DecodedPsbtOutput,
  addressForScript,
  decodePsbt,
} from './verifiers/psbt-decode';
export {
  type FoundSignature,
  type InputSignatureReport,
  type SignatureKind,
  checkSignature,
  collectSignatures,
  digestFor,
  parsePsbt,
  sighashName,
  signedInputIndexes,
  verifyPsbtSignatures,
} from './verifiers/psbt-signatures';
export { verifySighashSemantics } from './verifiers/sighash-semantics';
export {
  type DecodedStxPayload,
  type DecodedStxTransaction,
  decodePostCondition,
  decodeStxTransaction,
} from './verifiers/stx-decode';
export {
  type SignedPsbtExpectations,
  type StxTransactionExpectations,
  verifyAddresses,
  verifyProposal,
  verifySignedPsbt,
  verifyStxTransaction,
} from './verifiers/spec-verifiers';

//
// Scenarios — multi-step flows a single request cannot express.
export { findScenario, scenarios } from './scenarios/scenarios';

//
// Running a spec end to end against any wallet-backed context.
export {
  type RunSpecDeps,
  type RunSpecOptions,
  type SpecRun,
  type SpecVerdict,
  runSpec,
  runSpecs,
} from './run-spec';

//
// Scenario stepping, the programmatic API's types, and real-utxo access.
export { type ScenarioStepRun, runScenarioStep } from './scenarios/scenarios';
export { type SpecSummary, type TestAppApi } from './test-api';
export {
  type EsploraUtxo,
  type SpendableUtxo,
  broadcastTransaction,
  esploraConfigured,
  fetchBlockHeight,
  fetchOutputScript,
  fetchSpendableUtxo,
  fetchUtxos,
} from './utxo/esplora';
