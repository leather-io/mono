import {
  ClarityType,
  ClarityValue,
  ContractCallPayload,
  PayloadType,
  PostConditionMode,
  deserializeTransaction,
} from '@stacks/transactions';

const maxContractArguments = 252;
const sip10TransferArgumentCount = 4;
const maxSip10MemoBytes = 34;
const maxRawMessageBytes = 270;
const maxStructuredMessageBytes = 65_535;

function isPrincipal(value: ClarityValue) {
  return (
    value.type === ClarityType.PrincipalStandard || value.type === ClarityType.PrincipalContract
  );
}

function isExactSip10Transfer(payload: ContractCallPayload) {
  if (payload.functionName.content !== 'transfer') return false;
  if (payload.functionArgs.length !== sip10TransferArgumentCount) return false;

  const [amount, sender, recipient, memo] = payload.functionArgs;
  if (amount.type !== ClarityType.UInt || !isPrincipal(sender) || !isPrincipal(recipient)) {
    return false;
  }

  return (
    memo.type === ClarityType.OptionalNone ||
    (memo.type === ClarityType.OptionalSome &&
      memo.value.type === ClarityType.Buffer &&
      Buffer.byteLength(memo.value.value, 'hex') <= maxSip10MemoBytes)
  );
}

export function getLedgerStacksTransactionError(payload: Buffer): string | undefined {
  try {
    const transaction = deserializeTransaction(payload);
    if (!Buffer.from(transaction.serialize(), 'hex').equals(payload)) {
      return 'This transaction encoding is not supported with Ledger.';
    }

    if (transaction.postConditionMode !== PostConditionMode.Deny) {
      return 'Ledger transactions require Deny post-condition mode.';
    }

    if (transaction.payload.payloadType !== PayloadType.ContractCall) return;

    if (transaction.payload.functionArgs.length > maxContractArguments) {
      return 'Ledger contract calls must have fewer than 253 arguments.';
    }

    if (!isExactSip10Transfer(transaction.payload)) {
      return 'Ledger contract calls currently support only SIP-10 transfers with exactly four arguments.';
    }
    return undefined;
  } catch {
    return 'This transaction encoding is not supported with Ledger.';
  }
}

export function getLedgerStacksRawMessageError(payload: string): string | undefined {
  if (Buffer.byteLength(payload, 'utf8') > maxRawMessageBytes) {
    return 'Ledger messages must be 270 bytes or fewer.';
  }

  const containsControlCharacters = Array.from(payload).some(character => {
    const code = character.charCodeAt(0);
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
  });

  if (containsControlCharacters) {
    return 'Ledger messages cannot contain control characters, including tabs and line breaks.';
  }
  return undefined;
}

export function getLedgerStacksStructuredMessageError(
  domain: string,
  payload: string
): string | undefined {
  if ((domain.length + payload.length) / 2 > maxStructuredMessageBytes) {
    return 'Ledger structured messages, including their domain, must be 65,535 encoded bytes or fewer.';
  }

  if ([domain, payload].some(value => value.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(value))) {
    return 'This structured message encoding is not supported with Ledger.';
  }
  return undefined;
}
