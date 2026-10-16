import type { ApprovalConfirmation } from './pattern/approval-confirm';

type ApprovalRiskTier = 'none' | 'note' | 'caution' | 'blocking';

type ApprovalEventFamily =
  | 'connect'
  | 'contract_call'
  | 'deploy'
  | 'transfer'
  | 'sign_transaction'
  | 'bitcoin_send'
  | 'psbt'
  | 'message'
  | 'account'
  | 'vault';

type ApprovalCautionSource =
  | 'allow_mode'
  | 'address_history'
  | 'coin_selection'
  | 'contract_origin'
  | 'decoder'
  | 'device'
  | 'dry_run'
  | 'fee_ratio'
  | 'frame_check'
  | 'mempool'
  | 'name_service'
  | 'node'
  | 'quote'
  | 'request_rate'
  | 'scam_list'
  | 'sighash'
  | 'staking_rules'
  | 'vault_policy'
  | 'vault_queue';

type ApprovalDetailsDepth = 'section' | 'all_details';

type ApprovalFrictionMode = ApprovalConfirmation['mode'];

type ApprovalDecision =
  | 'approve'
  | 'cancel'
  | 'reject_all'
  | 'block_site'
  | 'window_closed'
  | 'expired';

type ApprovalDecisionTime = 'under_3s' | '3_to_10s' | '10_to_30s' | '30_to_120s' | 'over_120s';

type ApprovalResult = 'signed' | 'broadcast' | 'failed' | 'proposed';

type ApprovalFailure = 'node_rejected' | 'device_rejected' | 'network_error';

type ApprovalEventValue = string | number | boolean;

interface ApprovalViewedProperties {
  method: string;
  family: ApprovalEventFamily;
  riskTier: ApprovalRiskTier;
  contractRecognised?: boolean;
}

interface ApprovalViewedEvent {
  name: 'approval_viewed';
  properties: ApprovalViewedProperties;
}

interface ApprovalDetailsOpenedEvent {
  name: 'approval_details_opened';
  properties: { depth: ApprovalDetailsDepth };
}

interface ApprovalCautionShownEvent {
  name: 'approval_caution_shown';
  properties: { source: ApprovalCautionSource; tier: 'caution' | 'blocking' };
}

interface ApprovalFrictionCompletedEvent {
  name: 'approval_friction_completed';
  properties: { mode: ApprovalFrictionMode };
}

interface ApprovalDecisionEvent {
  name: 'approval_decision';
  properties: { decision: ApprovalDecision; timeToDecide: ApprovalDecisionTime };
}

interface ApprovalResultProperties {
  result: ApprovalResult;
  failure?: ApprovalFailure;
}

interface ApprovalResultEvent {
  name: 'approval_result';
  properties: ApprovalResultProperties;
}

export type ApprovalEvent =
  | ApprovalViewedEvent
  | ApprovalDetailsOpenedEvent
  | ApprovalCautionShownEvent
  | ApprovalFrictionCompletedEvent
  | ApprovalDecisionEvent
  | ApprovalResultEvent;

type ApprovalEventName = ApprovalEvent['name'];

export function viewed(
  method: string,
  family: ApprovalEventFamily,
  riskTier: ApprovalRiskTier,
  contractRecognised?: boolean
): ApprovalViewedEvent {
  const properties: ApprovalViewedProperties = { method, family, riskTier };
  if (contractRecognised !== undefined) properties.contractRecognised = contractRecognised;
  return { name: 'approval_viewed', properties };
}

export function detailsOpened(depth: ApprovalDetailsDepth): ApprovalDetailsOpenedEvent {
  return { name: 'approval_details_opened', properties: { depth } };
}

export function cautionShown(
  source: ApprovalCautionSource,
  tier: 'caution' | 'blocking' = 'caution'
): ApprovalCautionShownEvent {
  return { name: 'approval_caution_shown', properties: { source, tier } };
}

export function frictionCompleted(mode: ApprovalFrictionMode): ApprovalFrictionCompletedEvent {
  return { name: 'approval_friction_completed', properties: { mode } };
}

export function decided(
  decision: ApprovalDecision,
  timeToDecide: ApprovalDecisionTime
): ApprovalDecisionEvent {
  return { name: 'approval_decision', properties: { decision, timeToDecide } };
}

export function resulted(result: ApprovalResult, failure?: ApprovalFailure): ApprovalResultEvent {
  const properties: ApprovalResultProperties = { result };
  if (failure) properties.failure = failure;
  return { name: 'approval_result', properties };
}

function isEventValue(value: unknown): value is ApprovalEventValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function isEventEntry(entry: [string, unknown]): entry is [string, ApprovalEventValue] {
  return isEventValue(entry[1]);
}

export function eventProperties(event: ApprovalEvent): [string, ApprovalEventValue][] {
  const entries: [string, unknown][] = Object.entries(event.properties);
  return entries.filter(isEventEntry);
}

interface ApprovalEventPropertySpec {
  name: string;
  values: string;
}

interface ApprovalEventSpec {
  name: ApprovalEventName;
  when: string;
  properties: ApprovalEventPropertySpec[];
}

export const approvalCommonProperties: ApprovalEventPropertySpec[] = [
  { name: 'requestId', values: 'random per request, joins the events of one approval' },
  { name: 'directionId', values: 'the approval layout shown, for A/B tests' },
  { name: 'platform', values: 'extension, mobile' },
];

export const approvalEventSpecs: ApprovalEventSpec[] = [
  {
    name: 'approval_viewed',
    when: 'The approval has every fact it needs and the primary can arm.',
    properties: [
      { name: 'method', values: 'the RPC method, e.g. stx_callContract' },
      {
        name: 'family',
        values:
          'connect, contract_call, deploy, transfer, sign_transaction, bitcoin_send, psbt, message, account, vault',
      },
      { name: 'riskTier', values: 'none, note, caution, blocking (the loudest notice shown)' },
      { name: 'contractRecognised', values: 'true, false; only for contract calls' },
    ],
  },
  {
    name: 'approval_details_opened',
    when: 'Details or the details tray is opened, once per request.',
    properties: [{ name: 'depth', values: 'section, all_details' }],
  },
  {
    name: 'approval_caution_shown',
    when: 'A caution or blocking notice is on screen, once per notice.',
    properties: [
      { name: 'source', values: 'the check that raised it, e.g. contract_origin, dry_run' },
      { name: 'tier', values: 'caution, blocking' },
    ],
  },
  {
    name: 'approval_friction_completed',
    when: 'A hold, acknowledgement or retype is finished and the primary unlocks.',
    properties: [{ name: 'mode', values: 'hold, acknowledge, retype' }],
  },
  {
    name: 'approval_decision',
    when: 'The request ends, whichever way.',
    properties: [
      {
        name: 'decision',
        values: 'approve, cancel, reject_all, block_site, window_closed, expired',
      },
      {
        name: 'timeToDecide',
        values: 'under_3s, 3_to_10s, 10_to_30s, 30_to_120s, over_120s, from approval_viewed',
      },
    ],
  },
  {
    name: 'approval_result',
    when: 'Leather knows what happened after an approve.',
    properties: [
      { name: 'result', values: 'signed, broadcast, failed, proposed' },
      { name: 'failure', values: 'node_rejected, device_rejected, network_error; only on failed' },
    ],
  },
];

export const approvalNeverSent = [
  'Addresses, account names or vault names',
  'Amounts, balances, fees or USD values',
  'Message text, hashes, transaction ids or raw bytes',
  'Site origins or contract ids',
];
