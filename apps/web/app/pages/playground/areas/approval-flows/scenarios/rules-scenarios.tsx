import { styled } from 'leather-styles/jsx';

import { Badge, SbtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import { decided, resulted, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalAccountPicker } from '../pattern/approval-identity';
import {
  ApprovalCaution,
  ApprovalGuarantee,
  ApprovalNote,
  ApprovalPermission,
} from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalContractRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalSwitchRow } from '../pattern/approval-switch-row';
import { ApprovalPanel } from '../pattern/approval-tray';
import type { ApprovalAccount, ApprovalRequester } from '../pattern/approval-types';
import {
  account1,
  account1Stx,
  bitflow,
  contracts,
  feeUnderOneCent,
  leatherApp,
  localDapp,
  mainnet,
  testnet,
  vaultAccount,
  zest,
} from './fixtures';
import type { Scenario } from './scenario';

const unknownNetworkKey = 'pox5-devnet';

const testnetAccount1: ApprovalAccount = {
  ...account1,
  address: 'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ',
};

const testnetBitcoinAddress = 'tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjaq5ayy';

const leatherAppFirstVisit: ApprovalRequester = {
  ...leatherApp,
  connection: 'not-connected',
};

const signInMessage = `Sign in to Zest
Nonce: 8f2c41d7
Issued: 2026-09-25 09:14 UTC`;

export const rulesScenarios: Scenario[] = [
  {
    id: 'sign-mismatch',
    family: 'rules',
    label: 'Signing while Leather is set to another account',
    method: 'stx_callContract · deny mode',
    refs: ['#2752', '#2708'],
    events: [
      viewed('stx_callContract', 'contract_call', 'note', true),
      decided('approve', '10_to_30s'),
      resulted('broadcast'),
    ],
    note: 'The signer is always the account this site is connected to: it is in the header and cannot be switched here. Contract calls already sign with that account today; what is new is one quiet line when Leather itself is set to another account, and message and PSBT signing losing their switcher to match. The title assumes Bitflow is on the proposed Leather-owned list of known contracts.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              total={{
                amount: <ExactAmount value="1,000.003000" symbol="STX" />,
                fiat: '$812.40',
              }}
            />
          }
        >
          <ApprovalHeader requester={bitflow} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Swap 1,000 STX for sBTC"
            kind="Contract call · Bitflow swap, recognised by Leather"
          />
          <ApprovalNote>
            Leather is set to Account 3. This site is connected to Account 1, which signs this.
          </ApprovalNote>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="1,000.000000" symbol="STX" />}
              fiat="$812.40"
            />
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="You receive"
              qualifier="At least"
              amount={<ExactAmount value="0.00735000" symbol="sBTC" />}
              fiat="$806.87"
              direction="in"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Every movement is listed here, including the minimum the contract sends you. If
              anything else moves, the transaction fails.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="Details" divided collapsible summary="Contract, function, nonce">
            <ApprovalContractRow label="Contract" contractId={contracts.bitflowSwap} />
            <ApprovalRow
              label="Function"
              value={<ApprovalIdentifier>swap-helper-a</ApprovalIdentifier>}
            />
            <ApprovalDisclosureRow
              label="All details"
              caption="Arguments, nonce, raw transaction"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'network-unknown',
    family: 'rules',
    label: 'The site asks for a network Leather does not have',
    method: `stx_callContract · network: "${unknownNetworkKey}"`,
    refs: ['#2752'],
    events: [
      viewed('stx_callContract', 'contract_call', 'blocking'),
      decided('cancel', '3_to_10s'),
    ],
    note: 'An unknown network key stops the request instead of quietly falling back to the network Leather is on. The chip repeats the key exactly as the site sent it, no account line is shown because Leather can’t tell which address format an unknown network uses, and Cancel stays. Returning an error that names the network, rather than a plain rejection, needs an agreed RPC error code.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              blockedReason="Leather can’t sign on a network it doesn’t know."
            />
          }
        >
          <ApprovalHeader
            requester={localDapp}
            network={mainnet}
            trailing={<Badge label={unknownNetworkKey} variant="error" flexShrink={0} />}
          />
          <ApprovalIntent
            title="Leather doesn’t know this network"
            kind="Contract call · stopped before anything was built"
          />
          <ApprovalCaution
            tone="blocking"
            title="Leather won’t use another network instead"
            source={`the site’s request, network "${unknownNetworkKey}"`}
          >
            Leather can’t check balances, fees or the result on a network it doesn’t have.
          </ApprovalCaution>
          <ApprovalSection label="Network">
            <ApprovalRow
              label="The site asked for"
              value={<ApprovalIdentifier>{unknownNetworkKey}</ApprovalIdentifier>}
              caption="Not in Leather"
            />
            <ApprovalRow label="Leather is on" value="Mainnet" />
          </ApprovalSection>
          <ApprovalSection label="What you can do" divided>
            <styled.p textStyle="body.02" py="space.02">
              If you run this network, add it in Leather’s network settings with the network key{' '}
              {unknownNetworkKey}, then try again from the site. Otherwise, switch the site to
              Mainnet or Testnet.
            </styled.p>
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'connect-network-optin',
    family: 'rules',
    label: 'Connect when the site asks for Testnet and Leather is on Mainnet',
    method: 'getAddresses · stx_getAddresses · network: "testnet"',
    refs: ['#2671', '#2752'],
    note: 'The site connects on the network it asked for, named in the header, and gets Testnet addresses; switching Leather itself is a separate choice, off by default. Today the request silently sets the popup to Testnet and nothing on screen says so, and a Testnet vault stays hidden in Leather with no explanation. Keeping this site on Testnet while Leather stays on Mainnet needs Leather to read the network it already stores with each connection, which it does not do yet.',
    render() {
      return (
        <ApprovalShell
          footer={<ApprovalFooter primaryLabel="Connect Account 1" reversibility="removable" />}
        >
          <ApprovalHeader requester={leatherAppFirstVisit} network={testnet} />
          <ApprovalIntent
            title="Connect this site to Leather"
            kind="It is asking for your Testnet addresses"
          />
          <ApprovalSection label="Account">
            <ApprovalAccountPicker
              account={testnetAccount1}
              bitcoinAddress={testnetBitcoinAddress}
            />
          </ApprovalSection>
          <ApprovalSection label="Network" divided>
            <ApprovalSwitchRow
              title="Also switch Leather to Testnet"
              caption="Leather is on Mainnet and stays there unless you choose this. This site uses Testnet either way."
            />
          </ApprovalSection>
          <ApprovalSection label="This site will be able to" divided>
            <ApprovalPermission>
              See your Testnet Bitcoin (Native SegWit, Taproot) and Stacks addresses and balances
            </ApprovalPermission>
            <ApprovalPermission>
              Ask you to approve transactions and sign messages
            </ApprovalPermission>
            <ApprovalPermission kind="cannot">
              It can’t move funds or sign anything without asking you first
            </ApprovalPermission>
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'vault-method-refused',
    family: 'rules',
    label: 'A vault connection asks for something a vault cannot do',
    method: 'stx_signMessage · vault connected',
    refs: ['#2587'],
    note: 'A vault has no single key, so a message signature would come from Account 1’s personal key. Leather refuses and says how to get a personal signature, instead of quietly signing with that key as it does today. Leather’s own proposal commitments are the exception because Leather decodes what they commit to, and the error code the site gets back is still open.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter primaryLabel="Sign" blockedReason="A vault can’t sign this message." />
          }
        >
          <ApprovalHeader requester={zest} account={vaultAccount} network={mainnet} />
          <ApprovalIntent
            title="Team Treasury can’t sign this message"
            kind="Stacks message · plain text"
          />
          <ApprovalCaution
            tone="blocking"
            title="Your personal key would sign instead"
            source="this site’s connection to Team Treasury"
          >
            It would use Account 1’s own key, not Team Treasury. The site never saw that address, so
            Leather stops.
          </ApprovalCaution>
          <ApprovalSection label="The site asked you to sign">
            <ApprovalPanel>{signInMessage}</ApprovalPanel>
          </ApprovalSection>
          <ApprovalSection label="What you can do" divided>
            <styled.p textStyle="body.02" py="space.02">
              To sign as yourself, connect this site with Account 1 instead of Team Treasury.
            </styled.p>
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
];
