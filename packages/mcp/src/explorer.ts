export function stacksExplorerTxUrl(txid: string): string {
  const normalized = txid.startsWith('0x') ? txid : `0x${txid}`;
  return `https://explorer.hiro.so/txid/${normalized}?chain=mainnet`;
}

export function bitcoinExplorerTxUrl(txid: string): string {
  return `https://mempool.space/tx/${txid}`;
}
