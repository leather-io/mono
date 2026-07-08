import { t } from '@lingui/core/macro';
import {
  FungibleConditionCode,
  NonFungibleConditionCode,
  type PostConditionWire,
  PoxConditionCode,
  type PoxPostConditionWire,
  addressToString,
} from '@stacks/transactions';

import { truncateMiddle } from '@leather.io/utils';

type PostConditionVerb = 'transfer' | 'stake';

type NonPoxPostConditionWire = Exclude<PostConditionWire, PoxPostConditionWire>;

function getUserPcTitle(
  conditionCode: FungibleConditionCode | NonFungibleConditionCode,
  verb: string
) {
  return {
    [FungibleConditionCode.Equal]: t`You will ${verb} exactly`,
    [FungibleConditionCode.Greater]: t`You will ${verb} more than`,
    [FungibleConditionCode.GreaterEqual]: t`You will ${verb} equal to or greater than`,
    [FungibleConditionCode.Less]: t`You will ${verb} less than`,
    [FungibleConditionCode.LessEqual]: t`You will ${verb} less than or equal to`,
    [NonFungibleConditionCode.Sends]: t`You will transfer`,
    [NonFungibleConditionCode.DoesNotSend]: t`You will keep`,
    [NonFungibleConditionCode.MaybeSent]: t`You may transfer`,
  }[conditionCode];
}
function getContractPcTitle(
  conditionCode: FungibleConditionCode | NonFungibleConditionCode,
  verb: string
) {
  return {
    [FungibleConditionCode.Equal]: t`The contract will ${verb} exactly`,
    [FungibleConditionCode.Greater]: t`The contract will ${verb} more than`,
    [FungibleConditionCode.GreaterEqual]: t`The contract will ${verb} equal to or greater than`,
    [FungibleConditionCode.Less]: t`The contract will ${verb} less than`,
    [FungibleConditionCode.LessEqual]: t`The contract will ${verb} less than or equal to`,
    [NonFungibleConditionCode.Sends]: t`The contract will transfer`,
    [NonFungibleConditionCode.DoesNotSend]: t`The contract will keep`,
    [NonFungibleConditionCode.MaybeSent]: t`The contract may transfer`,
  }[conditionCode];
}

function getAddressPcTitle(
  conditionCode: FungibleConditionCode | NonFungibleConditionCode,
  address: string,
  verb: string
) {
  const shortenedPcAddress = truncateMiddle(address, 4);
  return {
    [FungibleConditionCode.Equal]: t`Another address ${shortenedPcAddress} will ${verb} exactly`,
    [FungibleConditionCode.Greater]: t`Another address ${shortenedPcAddress} will ${verb} more than`,
    [FungibleConditionCode.GreaterEqual]: t`Another address ${shortenedPcAddress} will ${verb} equal to or greater than`,
    [FungibleConditionCode.Less]: t`Another address ${shortenedPcAddress} will ${verb} less than`,
    [FungibleConditionCode.LessEqual]: t`Another address ${shortenedPcAddress} will ${verb} less than or equal to`,
    [NonFungibleConditionCode.Sends]: t`Another address ${shortenedPcAddress} will transfer`,
    [NonFungibleConditionCode.DoesNotSend]: t`Another address ${shortenedPcAddress} will keep`,
    [NonFungibleConditionCode.MaybeSent]: t`Another address ${shortenedPcAddress} may transfer`,
  }[conditionCode];
}

function getPoxTitle(conditionCode: PoxConditionCode, sender: string) {
  return {
    [PoxConditionCode.WillNotPerform]: t`${sender} must not perform any PoX actions`,
    [PoxConditionCode.MayPerform]: t`${sender} may perform PoX actions`,
    [PoxConditionCode.WillPerform]: t`${sender} must perform a PoX action`,
  }[conditionCode];
}

function getPoxSender(
  isContractPrincipal: boolean,
  userIsSending: boolean,
  address: string | null
) {
  if (isContractPrincipal) return t`The contract`;
  if (userIsSending) return t`You`;
  if (address) {
    const shortenedPcAddress = truncateMiddle(address, 4);
    return t`Another address ${shortenedPcAddress}`;
  }
  return null;
}

interface FormatPostConditionMessageArgs {
  stacksAddress: string;
  isContractPrincipal: boolean;
  postCondition: NonPoxPostConditionWire;
  context?: PostConditionVerb;
}

export function formatPostConditionMessage({
  stacksAddress,
  isContractPrincipal,
  postCondition: pc,
  context = 'transfer',
}: FormatPostConditionMessageArgs) {
  const address = 'address' in pc.principal ? addressToString(pc.principal.address) : null;
  const userIsSending = address === stacksAddress;
  const verb = context === 'stake' ? 'stake' : 'transfer';
  function getTitle() {
    if (isContractPrincipal) {
      return getContractPcTitle(pc.conditionCode, verb);
    }
    if (userIsSending) {
      return getUserPcTitle(pc.conditionCode, verb);
    }
    if (address) {
      return getAddressPcTitle(pc.conditionCode, address, verb);
    }
    return null;
  }

  return getTitle();
}

interface FormatPoxPostConditionMessageArgs {
  stacksAddress: string;
  isContractPrincipal: boolean;
  postCondition: PoxPostConditionWire;
}

export function formatPoxPostConditionMessage({
  stacksAddress,
  isContractPrincipal,
  postCondition: pc,
}: FormatPoxPostConditionMessageArgs) {
  const address = 'address' in pc.principal ? addressToString(pc.principal.address) : null;
  const userIsSending = address === stacksAddress;
  const sender = getPoxSender(isContractPrincipal, userIsSending, address);
  if (!sender) return null;
  return getPoxTitle(pc.conditionCode, sender);
}
