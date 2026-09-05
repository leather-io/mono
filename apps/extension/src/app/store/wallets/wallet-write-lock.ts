const walletWriteLockName = 'leather:wallet-authentication-write';

export async function withWalletWriteLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && 'locks' in navigator) {
    return navigator.locks.request(walletWriteLockName, operation);
  }
  return operation();
}
