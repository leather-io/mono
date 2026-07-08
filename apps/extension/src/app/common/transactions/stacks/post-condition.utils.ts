import {
  FungibleConditionCode,
  NonFungibleConditionCode,
  PostConditionMode,
  type PostConditionModeName,
  PostConditionType,
  type PostConditionWire,
  PoxConditionCode,
  type PoxPostConditionWire,
  addressToString,
  parsePrincipalString,
} from '@stacks/transactions';

import { getPostCondition } from '@leather.io/stacks';
import { assertUnreachable } from '@leather.io/utils';

import { stacksValue } from '@app/common/stacks-utils';

// TODO: Refactor pc utils to use with Approver UX
//
// These were used with legacy tx requests, so we have to keep them
// until we are able to remove that code entirely.

export function rpcPostConditionModeToEnum(mode?: PostConditionModeName) {
  if (mode === 'allow') return PostConditionMode.Allow;
  if (mode === 'originator') return PostConditionMode.Originator;
  return PostConditionMode.Deny;
}

export type NonPoxPostConditionWire = Exclude<PostConditionWire, PoxPostConditionWire>;

export type PostConditionVerb = 'transfer' | 'stake';

export function getIconStringFromPostCondition(pc: NonPoxPostConditionWire) {
  if (pc.conditionType === PostConditionType.Fungible)
    return `${addressToString(pc.asset.address)}.${pc.asset.contractName.content}.${
      pc.asset.assetName.content
    }`;
  if (pc.conditionType === PostConditionType.NonFungible) return pc.asset.assetName.content;
  return 'STX';
}

export function getAmountFromPostCondition(pc: NonPoxPostConditionWire) {
  if (pc.conditionType === PostConditionType.Fungible) return pc.amount.toString();
  if (pc.conditionType === PostConditionType.STX || pc.conditionType === PostConditionType.Staking)
    return stacksValue({ value: pc.amount.toString(), withTicker: false });
  return '';
}

export function getSymbolFromPostCondition(pc: NonPoxPostConditionWire) {
  if ('asset' in pc) {
    return pc.asset.assetName.content.slice(0, 3).toUpperCase();
  }
  return 'STX';
}

export function getNameFromPostCondition(pc: NonPoxPostConditionWire) {
  if ('asset' in pc) {
    return pc.asset.assetName.content;
  }
  return 'STX';
}

export function getPostConditionCodeMessage(
  code: FungibleConditionCode | NonFungibleConditionCode,
  isSender: boolean,
  context: PostConditionVerb = 'transfer'
) {
  const sender = isSender ? 'You' : 'The contract';
  const verb = context === 'stake' ? 'stake' : 'transfer';
  switch (code) {
    case FungibleConditionCode.Equal:
      return `${sender} will ${verb} exactly`;
    case FungibleConditionCode.Greater:
      return `${sender} will ${verb} more than`;
    case FungibleConditionCode.GreaterEqual:
      return `${sender} will ${verb} at least`;
    case FungibleConditionCode.Less:
      return `${sender} will ${verb} less than`;
    case FungibleConditionCode.LessEqual:
      return `${sender} will ${verb} at most`;
    case NonFungibleConditionCode.Sends:
      return `${sender} will transfer`;
    case NonFungibleConditionCode.DoesNotSend:
      return `${sender} will keep or receive`;
    case NonFungibleConditionCode.MaybeSent:
      return `${sender} may transfer`;
    default:
      assertUnreachable(code);
  }
}

export function getPoxConditionCodeMessage(code: PoxConditionCode, isSender: boolean) {
  const sender = isSender ? 'You' : 'The contract';
  switch (code) {
    case PoxConditionCode.WillNotPerform:
      return `${sender} must not perform any PoX actions`;
    case PoxConditionCode.MayPerform:
      return `${sender} may perform PoX actions`;
    case PoxConditionCode.WillPerform:
      return `${sender} must perform a PoX action`;
    default:
      assertUnreachable(code);
  }
}

/**
 * This method updates a post conditions principal
 * value to the current address principal if and only if
 * the `stxAddress` value from the original tx payload
 * matches the address in the original post condition
 *
 * This is used when a user might switch accounts during
 * the signing process. One can assume that if the post
 * condition has the principal set to the same value as the
 * `stxAddress` value, it should be updated when they switch
 * accounts.
 */
export function handlePostConditions(
  postConditions: PostConditionWire[],
  payloadAddress: string,
  currentAddress: string
): PostConditionWire[] {
  const payloadPrincipal = parsePrincipalString(payloadAddress);
  const currentAddressPrincipal = parsePrincipalString(currentAddress);

  return postConditions.map(postCondition => {
    const formattedPostCondition = getPostCondition(postCondition);
    if (
      'contractName' in formattedPostCondition.principal ||
      !('address' in formattedPostCondition.principal)
    )
      return formattedPostCondition;
    const { principal, ...payload } = formattedPostCondition;
    const sameType = payloadPrincipal.address.type === principal.address.type;
    const sameHash = payloadPrincipal.address.hash160 === principal.address.hash160;
    const isOriginatorAddress = sameHash && sameType;
    return {
      ...payload,
      principal: isOriginatorAddress ? currentAddressPrincipal : principal,
    };
  });
}

function getTitleFromConditionCode(
  code: FungibleConditionCode | NonFungibleConditionCode,
  context: PostConditionVerb = 'transfer'
) {
  const verb = context === 'stake' ? 'stake' : 'transfer';
  switch (code) {
    case FungibleConditionCode.Equal:
      return `will ${verb} exactly`;
    case FungibleConditionCode.Greater:
      return `will ${verb} more than`;
    case FungibleConditionCode.GreaterEqual:
      return `will ${verb} equal to or greater than`;
    case FungibleConditionCode.Less:
      return `will ${verb} less than`;
    case FungibleConditionCode.LessEqual:
      return `will ${verb} less than or equal to`;
    case NonFungibleConditionCode.Sends:
      return 'will transfer';
    case NonFungibleConditionCode.DoesNotSend:
      return 'will keep';
    case NonFungibleConditionCode.MaybeSent:
      return 'may transfer';
    default:
      return '';
  }
}

export function getPostConditionTitle(
  pc: NonPoxPostConditionWire,
  context: PostConditionVerb = 'transfer'
) {
  return getTitleFromConditionCode(pc.conditionCode, context) || '';
}

export function getPoxConditionTitle(code: PoxConditionCode) {
  switch (code) {
    case PoxConditionCode.WillNotPerform:
      return 'must not perform any PoX actions';
    case PoxConditionCode.MayPerform:
      return 'may perform PoX actions';
    case PoxConditionCode.WillPerform:
      return 'must perform a PoX action';
    default:
      return '';
  }
}
