// The lock script only stores the co-signer's pubkey; Ledger needs the xpub (BIP-388).
export const bondCovenantAccountKeys = [
  // private-1
  'tpubDF2dNLm8vgwf7xFNKn71bgcHWRwFN5AvTcWDiRYAUjTxibUNhEsmuVT7PP9GWaddDe8kfwN4yQ5gJPkSQ4Msf7oY9feFu5EFX9gy52zAmV7',
] as const;

export const bondCovenantLeaf = '0/0';
