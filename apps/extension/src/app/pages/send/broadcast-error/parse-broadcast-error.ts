interface ParsedBroadcastError {
  title: string;
  body: string;
}

interface ErrorPattern {
  patterns: string[];
  title: string;
  body: string;
}

const feeTooLowPatterns = ['feetoolow', 'fee too low', 'feerate', 'fee is less than'];
const nonceConflictPatterns = [
  'conflictingnoncesinmempool',
  'conflicting nonce',
  'nonce too low',
  'nonce already used',
];
const insufficientFundsPatterns = ['insufficient', 'not enough', 'notenoughfunds'];
const badNoncePatterns = ['badnonce', 'bad nonce'];
const contractErrorPatterns = ['contract', 'clarity', 'runtime error'];
const networkErrorPatterns = ['timeout', 'network', 'connection'];

const errorPatterns: ErrorPattern[] = [
  {
    patterns: feeTooLowPatterns,
    title: 'Transaction fee too low',
    body: 'The network rejected this transaction because the fee is below the minimum required. Please increase your fee and try again.',
  },
  {
    patterns: nonceConflictPatterns,
    title: 'Transaction conflict',
    body: 'A transaction with this nonce is already pending in the mempool. Wait for it to complete or try increasing its fee.',
  },
  {
    patterns: insufficientFundsPatterns,
    title: 'Insufficient funds',
    body: 'You do not have enough balance to complete this transaction including fees. Please reduce the amount or add more funds.',
  },
  {
    patterns: badNoncePatterns,
    title: 'Invalid nonce',
    body: 'The transaction nonce is invalid. This may happen if you have pending transactions. Please try again.',
  },
  {
    patterns: contractErrorPatterns,
    title: 'Contract error',
    body: 'The smart contract rejected this transaction. The operation may not be allowed or conditions were not met.',
  },
  {
    patterns: networkErrorPatterns,
    title: 'Network error',
    body: 'Unable to reach the network. Please check your connection and try again.',
  },
];

const defaultError: ParsedBroadcastError = {
  title: 'Transaction failed',
  body: 'Unable to broadcast transaction. Please review the error details below and try again.',
};

function matchesAnyPattern(message: string, patterns: string[]): boolean {
  return patterns.some(pattern => message.includes(pattern));
}

export function parseBroadcastError(errorMessage: string): ParsedBroadcastError {
  const lowerMessage = errorMessage.toLowerCase();

  const matchedError = errorPatterns.find(({ patterns }) =>
    matchesAnyPattern(lowerMessage, patterns)
  );

  if (matchedError) {
    return { title: matchedError.title, body: matchedError.body };
  }

  return defaultError;
}
