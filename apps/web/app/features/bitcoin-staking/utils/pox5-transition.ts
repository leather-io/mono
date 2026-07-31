import { Pox5StakerInfo } from '../queries/create-get-pox5-staker-info-query-options';

interface GetPox5NeedsRestakeArgs {
  pox4Stacked: boolean;
  lockedMicroStx: bigint;
  pox5StakerInfo: Pox5StakerInfo | null;
}

// pox-5 is live, so the only transition state left to detect is a wallet whose
// STX is still tied up in pox-4 with nothing staked under pox-5 yet.
export function getPox5NeedsRestake(args: GetPox5NeedsRestakeArgs): boolean {
  const { pox4Stacked, lockedMicroStx, pox5StakerInfo } = args;

  if (pox5StakerInfo !== null) return false;
  return pox4Stacked || lockedMicroStx > 0n;
}
