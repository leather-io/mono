import { styled } from 'leather-styles/jsx';

import { AddressDisplayer, SbtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import {
  cautionShown,
  decided,
  detailsOpened,
  frictionCompleted,
  resulted,
  viewed,
} from '../approval-flows.events';
import { ApprovalHighlightedAddress } from '../pattern/approval-confirm';
import { ApprovalFooter } from '../pattern/approval-footer';
import { middleGroupStart } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalAccountPicker } from '../pattern/approval-identity';
import {
  ApprovalCaution,
  ApprovalGuarantee,
  ApprovalPermission,
} from '../pattern/approval-notices';
import {
  ApprovalAssetRow,
  ApprovalContractRow,
  ApprovalDisclosureRow,
  ApprovalFeeRow,
  ApprovalIdentifier,
  ApprovalRecipientRow,
  ApprovalRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalSourceCheck } from '../pattern/approval-source';
import type { ApprovalRequester } from '../pattern/approval-types';
import {
  account1,
  account1Sbtc,
  account1Stx,
  bitflow,
  btcAccount1,
  contracts,
  feeUnderOneCent,
  mainnet,
} from './fixtures';
import type { Scenario } from './scenario';

const unlistedSite: ApprovalRequester = {
  context: {
    status: 'neutral',
    label: 'New site',
    description:
      'No previous connection in Leather. This does not establish whether the site is safe.',
  },
  origin: 'https://app.stxquest.xyz',
  connection: 'not-connected',
};

const lookalikeSite: ApprovalRequester = {
  context: {
    status: 'neutral',
    label: 'New site',
    description: 'Connected to Leather 2 minutes ago. A connection is not an endorsement.',
  },
  origin: 'https://bitflow-rewards.app',
  connection: 'connected',
};

const flaggedSite: ApprovalRequester = {
  context: {
    status: 'blocked',
    label: 'Reported site',
    description: 'This example site is reported for stealing funds.',
  },
  origin: 'https://claim-sbtc.net',
  connection: 'connected',
};

const lookalikeContract = 'SP1K9QZ3WV8N2M7R4T6Y0XHDA5CJBE8FG2PSN3QW.xyz-swap-helper-v-1-3';

const drainContract = 'SP2W8XK4R1N7B3QHZ5T9VJ0MCDA6EGY2FKS4P8TR.claim-rewards';

const newRecipient = 'SP3N4AJFZZYC4BK99H53XP8KDGXFGQ4PRSQTNG8QF';

const poisonedRecipient = 'SP2RCQ643DZVMXXQKFBF5KZNWJ47TAN9ZT24M9WQK';

const retypeLength = 4;

const subdomainSite: ApprovalRequester = {
  context: {
    status: 'caution',
    label: 'Lookalike',
    description: 'The actual domain is secure-login-verify.com, not bitflow.finance.',
  },
  origin: 'https://app.bitflow.finance.secure-login-verify.com',
  connection: 'not-connected',
};

export const sourceScenarios: Scenario[] = [
  {
    id: 'source-connect-new',
    family: 'source',
    label: 'Connect to a site Leather knows nothing about',
    method: 'getAddresses · first visit, unlisted site',
    note: 'The first connect is the moment a check matters most, so the list shows open. Nothing here is alarming: most new or small apps are not on Leather’s app list, and unlisted is stated as neutral, not as a warning. The scam-list check is the only one that can turn this screen red. Leather has no scam-list lookup today; the connection record it already keeps per site is enough for the first-visit line.',
    render() {
      return (
        <ApprovalShell
          footer={<ApprovalFooter primaryLabel="Connect Account 1" reversibility="removable" />}
        >
          <ApprovalHeader requester={unlistedSite} connecting={account1} network={mainnet} />
          <ApprovalIntent
            title="Connect this site to Leather"
            kind="It is asking for your addresses"
          />
          <ApprovalSection label="Account">
            <ApprovalAccountPicker account={account1} bitcoinAddress={btcAccount1.nativeSegwit} />
          </ApprovalSection>
          <ApprovalSection label="About this site" divided>
            <ApprovalSourceCheck
              status="neutral"
              title="First time you use this site with Leather"
            />
            <ApprovalSourceCheck
              status="neutral"
              title="Not in Leather’s app list"
              caption="Most new or small apps aren’t. It doesn’t mean the site is unsafe."
            />
            <ApprovalSourceCheck
              status="neutral"
              title="Not on known scam lists"
              caption="Checked just now"
            />
          </ApprovalSection>
          <ApprovalSection label="This site will be able to" divided>
            <ApprovalPermission>
              See your Bitcoin (Native SegWit, Taproot) and Stacks addresses and balances
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
    id: 'source-contract-confirmed',
    family: 'source',
    label: 'A known site calls a contract it has proven it owns',
    method: 'stx_callContract · contract origin confirmed',
    refs: ['#2700'],
    note: 'When every check passes, the list collapses to one summary line, so a normal swap reads as calm as today. The contract line comes from the Origin hackday project: the site proves it controls the contract’s deployer with a signed file on its own domain, a voucher Leather recognises records that on chain, and Leather reads it from the decoded transaction, never from the site. A failed or slow lookup shows as unconfirmed, never as confirmed.',
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
              Every movement is listed here. If anything else moves, the transaction fails.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection
            label="About this request"
            divided
            collapsible
            summary="3 checks passed, 1 note"
          >
            <ApprovalSourceCheck
              status="clear"
              title="You’ve used this site since March"
              caption="Connected to Account 1 · 23 requests"
            />
            <ApprovalSourceCheck status="clear" title="Bitflow is in Leather’s app list" />
            <ApprovalSourceCheck
              status="clear"
              title="This contract belongs to app.bitflow.finance"
              caption="The site proved it controls the contract’s deployer"
            />
            <ApprovalSourceCheck status="neutral" title="Not on known scam lists" />
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
    id: 'source-contract-lookalike',
    family: 'source',
    label: 'A contract that copies a known contract’s name',
    method: 'stx_callContract · lookalike contract',
    refs: ['#2700'],
    events: [
      viewed('stx_callContract', 'contract_call', 'caution', false),
      cautionShown('contract_origin'),
      detailsOpened('section'),
      decided('cancel', '10_to_30s'),
    ],
    note: 'Same contract name as Bitflow’s swap, different deployer: the Origin check flags it as a possible lookalike, and the list stays open because something needs a look. It is a caution, not a block, since a new version or a fork can look the same; Leather names what it compared instead of guessing intent. The title falls back to the function name because this contract is not on Leather’s list. Approve stays off until you switch on one line that names the fact to check, instead of a general “be careful”.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              confirmation={{
                mode: 'acknowledge',
                statement: 'I understand this isn’t Bitflow’s contract',
              }}
              total={{
                amount: <ExactAmount value="1,000.003000" symbol="STX" />,
                fiat: '$812.40',
              }}
            />
          }
        >
          <ApprovalHeader requester={lookalikeSite} account={account1Stx} network={mainnet} />
          <ApprovalIntent
            title="Call swap-helper-a, sending 1,000 STX"
            kind={
              <>
                Contract call to{' '}
                <ApprovalIdentifier principal>{lookalikeContract}</ApprovalIdentifier>
              </>
            }
          />
          <ApprovalCaution
            title="This contract copies a Bitflow contract’s name"
            source="Leather’s contract origin check"
          >
            Bitflow’s own swap contract has the same name but a different deployer. Check you are on
            the site you meant to use.
          </ApprovalCaution>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="1,000.000000" symbol="STX" />}
              fiat="$812.40"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.003000" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
            <ApprovalGuarantee kind="strict">
              Every movement is listed here. If anything else moves, the transaction fails.
            </ApprovalGuarantee>
          </ApprovalSection>
          <ApprovalSection label="About this request" divided>
            <ApprovalSourceCheck
              status="caution"
              title="Same name as a Bitflow contract"
              caption="Deployed by a different address than Bitflow’s"
            />
            <ApprovalSourceCheck
              status="neutral"
              title="No confirmed owner"
              caption="No one Leather recognises has vouched for this contract"
            />
            <ApprovalSourceCheck
              status="neutral"
              title="Connected 2 minutes ago"
              caption="Not in Leather’s app list"
            />
            <ApprovalSourceCheck
              status="neutral"
              title="Not on known scam lists"
              caption="New scam sites are often not listed yet"
            />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'source-site-flagged',
    family: 'source',
    label: 'A site on a scam list',
    method: 'stx_callContract · origin on a phishing list',
    events: [
      viewed('stx_callContract', 'contract_call', 'blocking', false),
      cautionShown('scam_list', 'blocking'),
      decided('cancel', '3_to_10s'),
    ],
    note: 'The one case that blocks outright: the site is on a public scam list. Leather still shows what the site asked for, so the stop is explainable, and names the list as the source. There is no continue button here; whether to allow an override behind a confirmation, as Rabby and MetaMask do in different ways, is a decision. Leather has no scam-list lookup today, so this needs a provider.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Approve"
              blockedReason="Leather won’t sign for a site on a scam list."
            />
          }
        >
          <ApprovalHeader requester={flaggedSite} account={account1Sbtc} network={mainnet} />
          <ApprovalIntent
            title="Leather stopped this request"
            kind="Contract call · this site is reported as a scam"
          />
          <ApprovalCaution
            tone="blocking"
            title="This site is reported for stealing funds"
            source="a public scam list, updated today"
          >
            Sites like this copy real apps to get you to sign away your assets. Close this window
            and leave the site.
          </ApprovalCaution>
          <ApprovalSection label="What it asked for">
            <ApprovalAssetRow
              icon={<SbtcAvatarIcon size="md" />}
              label="You send"
              qualifier="Everything"
              amount={<ExactAmount value="0.48210000" symbol="sBTC" />}
              fiat="$52,923.97"
            />
            <ApprovalContractRow label="To contract" contractId={drainContract} />
          </ApprovalSection>
          <ApprovalSection label="What you can do" divided>
            <styled.p textStyle="body.02" py="space.02">
              Nothing was signed. If you reached this site from a link, don’t use that link again.
            </styled.p>
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'source-long-subdomain',
    family: 'source',
    label: 'A site that puts a known app’s name in front of its own',
    method: 'getAddresses · lookalike subdomain',
    events: [
      viewed('getAddresses', 'connect', 'note'),
      frictionCompleted('acknowledge'),
      decided('approve', '30_to_120s'),
    ],
    note: 'The header always keeps the part of the address someone had to register, here secure-login-verify.com, in full weight, and cuts anything in front of it from the left. Today the request caption shows the full host in one weight after the name the site gives itself, so nothing marks which part was registered, and cutting a long name from the right would leave only the copied app.bitflow.finance part. Because Bitflow is in Leather’s app list, Leather can also notice its name being used as a prefix and say so as a caution; Connect stays off until you switch on the line that names it.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Connect Account 1"
              reversibility="removable"
              confirmation={{
                mode: 'acknowledge',
                statement: 'I understand this site isn’t bitflow.finance',
              }}
            />
          }
        >
          <ApprovalHeader requester={subdomainSite} connecting={account1} network={mainnet} />
          <ApprovalIntent
            title="Connect this site to Leather"
            kind="It is asking for your addresses"
          />
          <ApprovalSection label="Account">
            <ApprovalAccountPicker account={account1} bitcoinAddress={btcAccount1.nativeSegwit} />
          </ApprovalSection>
          <ApprovalSection label="About this site" divided>
            <ApprovalSourceCheck
              status="caution"
              title="This isn’t bitflow.finance"
              caption="The site is secure-login-verify.com. It starts with Bitflow’s address to look like it."
            />
            <ApprovalSourceCheck
              status="neutral"
              title="First time you use this site with Leather"
            />
            <ApprovalSourceCheck
              status="neutral"
              title="Not on known scam lists"
              caption="New scam sites are often not listed yet"
            />
          </ApprovalSection>
          <ApprovalSection label="This site will be able to" divided>
            <ApprovalPermission>
              See your Bitcoin (Native SegWit, Taproot) and Stacks addresses and balances
            </ApprovalPermission>
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'source-recipient-new',
    family: 'source',
    label: 'Sending to an address for the first time',
    method: 'stx_transferStx · new recipient',
    note: 'The same checks apply to where funds go, as the Origin project plans for recipients next. A first transfer to an address is common, so it is a neutral line, not a warning; it becomes a caution only when the address looks like one you have sent to before but differs in the middle, which is how address poisoning works. The list collapses because nothing needs a look.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Send"
              reversibility="once-confirmed"
              total={{
                amount: <ExactAmount value="500.002100" symbol="STX" />,
                fiat: '$406.20',
              }}
            />
          }
        >
          <ApprovalHeader requester={bitflow} account={account1Stx} network={mainnet} />
          <ApprovalIntent title="Send 500 STX" kind="STX transfer" />
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="500.000000" symbol="STX" />}
              fiat="$406.20"
            />
            <ApprovalRecipientRow
              address={<AddressDisplayer address={newRecipient} />}
              context={{
                status: 'neutral',
                label: 'New recipient',
                description: 'No previous send to this address in Leather’s history.',
              }}
              caption="First transfer to this address"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.002100" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
          </ApprovalSection>
          <ApprovalSection
            label="About this request"
            divided
            collapsible
            summary="1 check passed, 2 notes"
          >
            <ApprovalSourceCheck
              status="neutral"
              title="You haven’t sent to this address before"
              caption="It doesn’t look like any address you have used"
            />
            <ApprovalSourceCheck status="clear" title="You’ve used this site since March" />
            <ApprovalSourceCheck status="neutral" title="Not on known scam lists" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
  {
    id: 'source-recipient-lookalike',
    family: 'source',
    label: 'Sending to an address that looks like one you’ve used',
    method: 'stx_transferStx · lookalike recipient',
    events: [
      viewed('stx_transferStx', 'transfer', 'caution'),
      cautionShown('address_history'),
      frictionCompleted('retype'),
      decided('approve', '30_to_120s'),
      resulted('broadcast'),
    ],
    note: 'Address poisoning: someone sends you a tiny amount from an address that starts and ends like one you use, hoping you copy it from your history next time. Leather compares the recipient with addresses you have sent to and flags a match on the first and last four characters with a different middle. The middle group is highlighted on the recipient itself, and Send stays off until you type it, which makes you read the part people skip. Leather has no address-history check today; the send history it already shows in Activity is enough to build one.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Send"
              reversibility="once-confirmed"
              confirmation={{
                mode: 'retype',
                prompt: 'Type the highlighted characters from the address',
                value: poisonedRecipient,
                start: middleGroupStart(poisonedRecipient),
                length: retypeLength,
              }}
              total={{
                amount: <ExactAmount value="2,400.002100" symbol="STX" />,
                fiat: '$1,949.76',
              }}
            />
          }
        >
          <ApprovalHeader requester={bitflow} account={account1Stx} network={mainnet} />
          <ApprovalIntent title="Send 2,400 STX" kind="STX transfer" />
          <ApprovalCaution
            title="This address only looks like one you’ve used"
            source="Leather’s address history check"
          >
            It starts and ends like SP2R…9WQK, which you sent to on 12 September, but the middle is
            different. Check it against the address you meant to use.
          </ApprovalCaution>
          <ApprovalSection label="What moves">
            <ApprovalAssetRow
              icon={<StxAvatarIcon size="md" />}
              label="You send"
              qualifier="Exactly"
              amount={<ExactAmount value="2,400.000000" symbol="STX" />}
              fiat="$1,949.76"
            />
            <ApprovalRecipientRow
              address={
                <ApprovalHighlightedAddress
                  address={poisonedRecipient}
                  start={middleGroupStart(poisonedRecipient)}
                  length={retypeLength}
                />
              }
              context={{
                status: 'caution',
                label: 'Lookalike',
                description: 'Matches the ends of a previous recipient, but the middle differs.',
              }}
              caption="You haven’t sent to this address before"
            />
            <ApprovalFeeRow
              amount={<ExactAmount value="0.002100" symbol="STX" />}
              fiat={feeUnderOneCent}
              speed="standard"
              caption="Standard"
              action={<ApprovalRowAction label="Edit" />}
            />
          </ApprovalSection>
          <ApprovalSection label="About this request" divided>
            <ApprovalSourceCheck
              status="caution"
              title="Looks like an address you’ve sent to"
              caption="Same first and last 4 characters as SP2R…9WQK, different middle"
            />
            <ApprovalSourceCheck
              status="neutral"
              title="Sent you 0.000001 STX yesterday"
              caption="Tiny transfers like this plant the lookalike in your history"
            />
            <ApprovalSourceCheck status="clear" title="You’ve used this site since March" />
          </ApprovalSection>
        </ApprovalShell>
      );
    },
  },
];
