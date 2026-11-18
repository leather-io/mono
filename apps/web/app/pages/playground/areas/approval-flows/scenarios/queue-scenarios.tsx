import { useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { AddressDisplayer, Button, SbtcAvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import { cautionShown, decided, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { displayOrigin } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { ApprovalCaution, ApprovalGuarantee, ApprovalNote } from '../pattern/approval-notices';
import { ApprovalQueueBar } from '../pattern/approval-queue';
import {
  ApprovalAssetRow,
  ApprovalFeeRow,
  ApprovalRecipientRow,
  ApprovalRowAction,
  ExactAmount,
} from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { ApprovalPanel } from '../pattern/approval-tray';
import type { ApprovalRequester } from '../pattern/approval-types';
import { account1Stx, bitflow, btcSigner, feeUnderOneCent, gamma, mainnet } from './fixtures';
import type { Scenario } from './scenario';

const floodingSite: ApprovalRequester = {
  origin: 'https://stx-rewards.claims',
  connection: 'connected',
};

const floodingRecipient = 'SP1X7M2KQ9RDZ5B4N8T0VWF6HJ3CGA1YESPQ2K8N';

interface QueuedSwap {
  kind: 'swap';
  origin: string;
  send: string;
  sendFiat: string;
  receive: string;
  receiveFiat: string;
  total: string;
}

interface QueuedMessage {
  kind: 'message';
  origin: string;
  message: string;
}

type QueuedRequest = QueuedSwap | QueuedMessage;

const queuedRequests: QueuedRequest[] = [
  {
    kind: 'swap',
    origin: bitflow.origin,
    send: '1,000.000000',
    sendFiat: '$812.40',
    receive: '0.00735000',
    receiveFiat: '$806.87',
    total: '1,000.003000',
  },
  {
    kind: 'swap',
    origin: bitflow.origin,
    send: '250.000000',
    sendFiat: '$203.10',
    receive: '0.00183700',
    receiveFiat: '$201.66',
    total: '250.003000',
  },
  {
    kind: 'message',
    origin: gamma.origin,
    message:
      'Sign this message to prove you own this address.\n\nNonce: 4c1d92e07a\nIssued: 2026-09-28T09:14:52Z',
  },
];

function toRequester(origin: string): ApprovalRequester {
  return { origin, connection: 'connected' };
}

function siteChangeNote(index: number) {
  const current = queuedRequests[index];
  const previous = queuedRequests[index - 1];
  if (!current || !previous || current.origin === previous.origin) return undefined;
  const earlier = queuedRequests.slice(0, index);
  const earlierOrigins = new Set(earlier.map(request => request.origin));
  if (earlierOrigins.size > 1) return 'Earlier requests came from other sites';
  return `The first ${earlier.length} came from ${displayOrigin(previous.origin)}`;
}

function swapTitle(request: QueuedSwap) {
  const [whole = request.send] = request.send.split('.');
  return `Swap ${whole} STX for sBTC`;
}

function QueueScreen() {
  const [index, setIndex] = useState(0);
  const request = queuedRequests[index] ?? queuedRequests[0];
  if (!request) return null;
  const requester = toRequester(request.origin);
  const isSwap = request.kind === 'swap';
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel={isSwap ? 'Approve' : 'Sign'}
          reversibility={isSwap ? 'once-confirmed' : undefined}
          total={
            isSwap
              ? {
                  amount: <ExactAmount value={request.total} symbol="STX" />,
                  fiat: request.sendFiat,
                }
              : undefined
          }
        />
      }
    >
      <ApprovalQueueBar
        position={index + 1}
        total={queuedRequests.length}
        origin={request.origin}
        siteChangeNote={siteChangeNote(index)}
        onPrevious={() => setIndex(current => Math.max(0, current - 1))}
        onNext={() => setIndex(current => Math.min(queuedRequests.length - 1, current + 1))}
      />
      <ApprovalHeader
        requester={requester}
        account={isSwap ? account1Stx : btcSigner}
        network={mainnet}
      />
      {request.kind === 'swap' && (
        <ApprovalIntent
          title={swapTitle(request)}
          kind="Contract call · Bitflow swap, recognised by Leather"
        />
      )}
      {request.kind === 'swap' && (
        <ApprovalSection label="What moves">
          <ApprovalAssetRow
            icon={<StxAvatarIcon size="md" />}
            label="You send"
            qualifier="Exactly"
            amount={<ExactAmount value={request.send} symbol="STX" />}
            fiat={request.sendFiat}
          />
          <ApprovalAssetRow
            icon={<SbtcAvatarIcon size="md" />}
            label="You receive"
            qualifier="At least"
            amount={<ExactAmount value={request.receive} symbol="sBTC" />}
            fiat={request.receiveFiat}
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
      )}
      {request.kind === 'message' && (
        <ApprovalIntent title="Sign a message" kind="Bitcoin message · BIP-322" />
      )}
      {request.kind === 'message' && (
        <ApprovalSection label="Message">
          <ApprovalPanel maxHeight="132px">{request.message}</ApprovalPanel>
        </ApprovalSection>
      )}
      {request.kind === 'message' && <ApprovalNote>No fee, and no bitcoin moves.</ApprovalNote>}
    </ApprovalShell>
  );
}

function RepeatRequestScreen() {
  return (
    <ApprovalShell
      footer={
        <ApprovalFooter
          primaryLabel="Send"
          reversibility="once-confirmed"
          total={{
            amount: <ExactAmount value="2,500.003000" symbol="STX" />,
            fiat: '$2,031.00',
          }}
        />
      }
    >
      <ApprovalHeader requester={floodingSite} account={account1Stx} network={mainnet} />
      <ApprovalIntent title={'Send 2,500\u00a0STX'} kind="STX transfer" />
      <ApprovalCaution
        title="3rd request from this site in a minute"
        source="Leather, from your recent requests"
      >
        You cancelled the last 2. Sites that keep asking are often waiting for a tired click.
        <styled.span display="block" mt="space.03">
          <Button variant="outline" size="sm">
            Block this site for 1 hour
          </Button>
        </styled.span>
      </ApprovalCaution>
      <ApprovalSection label="What moves">
        <ApprovalAssetRow
          icon={<StxAvatarIcon size="md" />}
          label="You send"
          qualifier="Exactly"
          amount={<ExactAmount value="2,500.000000" symbol="STX" />}
          fiat="$2,031.00"
        />
        <ApprovalRecipientRow
          address={<AddressDisplayer address={floodingRecipient} />}
          caption="First transfer to this address"
        />
        <ApprovalFeeRow
          amount={<ExactAmount value="0.003000" symbol="STX" />}
          fiat={feeUnderOneCent}
          speed="standard"
          caption="Standard"
          action={<ApprovalRowAction label="Edit" />}
        />
      </ApprovalSection>
    </ApprovalShell>
  );
}

export const queueScenarios: Scenario[] = [
  {
    id: 'queue-multiple-requests',
    family: 'state',
    label: 'Several requests at once',
    method: 'any request · 3 waiting',
    refs: ['#2587'],
    events: [
      viewed('stx_callContract', 'contract_call', 'none', true),
      decided('approve', '3_to_10s'),
      viewed('stx_callContract', 'contract_call', 'none', true),
      decided('reject_all', '3_to_10s'),
    ],
    note: 'When a request arrives while another is open, Leather adds it to the same window instead of opening another on top. A bar above the header says which one this is and who sent it (“1 of 3 from app.bitflow.finance”), with previous and next, and Reject all to clear the lot in one go; Cancel still answers only the one on screen. When the site changes mid-queue, the bar says so with a New site badge and the header changes with it, so a second tab can’t slip a request in behind a familiar one. Moving to another request re-arms the click guard. Use the arrows: request 3 comes from gamma.io. Today every request opens its own popup window at the same spot, so they stack and the one on top may not be the one you think. Open question: the order (oldest first here) and whether a site can have more than one request waiting.',
    render() {
      return <QueueScreen />;
    },
  },
  {
    id: 'queue-repeat-after-reject',
    family: 'state',
    label: 'A site keeps asking after you cancel',
    method: 'stx_transferStx · 3rd in a minute',
    refs: ['#2587'],
    events: [
      viewed('stx_transferStx', 'transfer', 'caution'),
      cautionShown('request_rate'),
      decided('block_site', 'under_3s'),
    ],
    note: `The third request from one site within a minute, after the first two were cancelled, carries a caution that says exactly that and one tap to block the site for an hour. Blocking cancels this request and turns away the site’s next ones without opening a window, and the block is listed in Settings with a way to lift it early. The screen is otherwise the normal one, so approving stays possible. Today nothing limits how often a site can open the popup, and every request opens a new window, so a site can keep one on screen until someone gives in. ${displayOrigin(floodingSite.origin)} is an example site. Open questions: the exact count and window, and whether a block also disconnects the site.`,
    render() {
      return <RepeatRequestScreen />;
    },
  },
];
