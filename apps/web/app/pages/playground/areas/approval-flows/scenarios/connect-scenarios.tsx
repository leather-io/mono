import { decided, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalAccountPicker } from '../pattern/approval-identity';
import { ApprovalNote, ApprovalPermission } from '../pattern/approval-notices';
import { ApprovalRow } from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { account1, bitflow, btcAccount1, mainnet, newSite, walletConnectSite } from './fixtures';
import type { Scenario } from './scenario';

function ConnectPermissions() {
  return (
    <ApprovalSection label="This site will be able to" divided>
      <ApprovalPermission>
        See your Bitcoin (Native SegWit, Taproot) and Stacks addresses and balances
      </ApprovalPermission>
      <ApprovalPermission>Ask you to approve transactions and sign messages</ApprovalPermission>
      <ApprovalPermission kind="cannot">
        It can’t move funds or sign anything without asking you first
      </ApprovalPermission>
    </ApprovalSection>
  );
}

export const connectScenarios: Scenario[] = [
  {
    id: 'connect-first',
    family: 'connect',
    label: 'Connect, first time',
    method: 'getAddresses · stx_getAddresses',
    captureId: '08-get-addresses',
    refs: ['#2671', '#2708', '#2806', '#2594'],
    events: [viewed('getAddresses', 'connect', 'none'), decided('approve', '3_to_10s')],
    note: 'One white surface instead of today’s grey bands, with the network named and the button naming the account being connected. Today picking another account here switches the whole wallet; here it only sets this site’s connection, which needs the grant decoupled from the active account. What the site cannot do is a new line, stated as reassurance.',
    render() {
      return (
        <ApprovalShell
          footer={<ApprovalFooter primaryLabel="Connect Account 1" reversibility="removable" />}
        >
          <ApprovalHeader requester={newSite} connecting={account1} network={mainnet} />
          <ApprovalIntent
            title="Connect this site to Leather"
            kind="It is asking for your addresses"
          />
          <ApprovalSection label="Account">
            <ApprovalAccountPicker account={account1} bitcoinAddress={btcAccount1.nativeSegwit} />
          </ApprovalSection>
          <ConnectPermissions />
        </ApprovalShell>
      );
    },
  },
  {
    id: 'connect-reconnect',
    family: 'connect',
    label: 'Reconnect on a site that already has a grant',
    method: 'getAddresses · the site asks to connect again',
    refs: ['#2708', '#2752', '#2807'],
    note: 'With the recommended silent answer to repeat requests, this screen appears only when a connected site asks to connect anew: it preselects the connected account, labelled Connected, and one quiet line says when Leather itself is set to another account. Today every getAddresses opens Connect on the wallet’s active account and re-points the site on confirm. Preselecting the grant reverses an earlier change that made Connect ignore it.',
    render() {
      return (
        <ApprovalShell
          footer={<ApprovalFooter primaryLabel="Continue as Account 1" reversibility="removable" />}
        >
          <ApprovalHeader requester={bitflow} connecting={account1} network={mainnet} />
          <ApprovalIntent
            title="Continue with this site"
            kind="Already connected. It is asking to connect again"
          />
          <ApprovalSection label="Account">
            <ApprovalAccountPicker
              account={account1}
              bitcoinAddress={btcAccount1.nativeSegwit}
              isConnected
            />
          </ApprovalSection>
          <ApprovalNote>
            Leather is set to Account 3 right now. This site stays on Account 1 unless you change it
            here.
          </ApprovalNote>
          <ConnectPermissions />
        </ApprovalShell>
      );
    },
  },
  {
    id: 'connect-walletconnect',
    family: 'connect',
    label: 'Connect from a mobile browser, through WalletConnect',
    method: 'WalletConnect session proposal · stacks, bip122',
    refs: ['#2754', '#2595', '#2594', '#2442'],
    events: [viewed('getAddresses', 'connect', 'note'), decided('approve', '10_to_30s')],
    note: 'Proposed for Leather mobile: a site open in a normal mobile browser, or on a computer, pairs through WalletConnect and the approval opens in the app. Today Leather has no WalletConnect support, so on a mobile browser the site can only say to install the extension. The request arrives over a relay, not from a page Leather can see, so the header says Through WalletConnect and a quiet line says the site name is checked by WalletConnect’s domain verification rather than read from a tab. The session keeps working after this screen closes, so the screen says which chains it covers and when it ends. The nearer fix, a link that opens the site in Leather’s own browser, needs no new screen: Connect runs there as it does in the extension.',
    render() {
      return (
        <ApprovalShell
          footer={<ApprovalFooter primaryLabel="Connect Account 1" reversibility="removable" />}
        >
          <ApprovalHeader requester={walletConnectSite} connecting={account1} network={mainnet} />
          <ApprovalIntent
            title="Connect this site to Leather"
            kind="It is open in another browser and asking for your addresses"
          />
          <ApprovalSection label="Account">
            <ApprovalAccountPicker account={account1} bitcoinAddress={btcAccount1.nativeSegwit} />
          </ApprovalSection>
          <ApprovalSection label="Session" divided>
            <ApprovalRow label="Chains" value="Bitcoin and Stacks" />
            <ApprovalRow
              label="Ends"
              value="In 7 days"
              caption="Or when you end it in Connected sites"
            />
          </ApprovalSection>
          <ApprovalNote icon="shield">
            Leather can’t see the page this comes from. The site name is checked by WalletConnect’s
            domain verification.
          </ApprovalNote>
          <ConnectPermissions />
        </ApprovalShell>
      );
    },
  },
];
