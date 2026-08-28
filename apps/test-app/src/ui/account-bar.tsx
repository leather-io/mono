// What the origin is actually bound to.
//
// RPC requests resolve their account from the per-origin permission binding,
// not from whatever looks selected in the wallet UI — which is the single most
// common reason a button "does the wrong thing". Showing the bound account,
// and whether it is singlesig or a policy, turns that into something visible.
import type { AccountSummary } from '../wallet';
import { shortenMiddle } from './format';

interface AccountBarProps {
  account?: AccountSummary;
  error?: string;
  onLoad(): void;
  onRefresh(): void;
}

export function AccountBar({ account, error, onLoad, onRefresh }: AccountBarProps) {
  if (error)
    return (
      <div className="account-bar account-bar-error" data-testid="account-bar" data-state="error">
        <span>Could not read the bound account: {error}</span>
        <button type="button" onClick={onLoad}>
          Retry
        </button>
      </div>
    );

  if (!account)
    return (
      <div className="account-bar" data-testid="account-bar" data-state="unknown">
        <span className="muted">
          The account bound to this origin is unknown until you share addresses.
        </span>
        <button type="button" data-control="load-account" onClick={onLoad}>
          Load account
        </button>
      </div>
    );

  const kind = account.policyAddress ? 'policy' : 'singlesig';

  return (
    <div
      className="account-bar"
      data-testid="account-bar"
      data-state="loaded"
      data-kind={kind}
      data-network={account.network}
    >
      <span className={`chip chip-${kind}`}>
        {kind === 'policy' ? 'Policy account' : 'Singlesig'}
      </span>
      {account.btcAddress && (
        <span title={account.btcAddress}>BTC {shortenMiddle(account.btcAddress)}</span>
      )}
      {account.taprootAddress && (
        <span title={account.taprootAddress}>TR {shortenMiddle(account.taprootAddress)}</span>
      )}
      {account.policyAddress && (
        <span title={account.policyDescriptor}>Vault {shortenMiddle(account.policyAddress)}</span>
      )}
      {account.stxAddress && (
        <span title={account.stxAddress}>
          STX {shortenMiddle(account.stxAddress)}
          {account.stxMultisig
            ? ` (${account.stxMultisig.threshold}-of-${account.stxMultisig.publicKeys.length})`
            : ''}
        </span>
      )}
      <button type="button" data-control="refresh-account" onClick={onRefresh}>
        Refresh
      </button>
    </div>
  );
}
