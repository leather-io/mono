export enum BitcoinErrorMessage {
  InsufficientFunds = 'Insufficient funds',
  NoInputsToSign = 'No inputs to sign',
  NoOutputsToSign = 'No outputs to sign',
}

export class BitcoinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BitcoinError';

    // Fix the prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
