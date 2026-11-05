import { Box, Stack, styled } from 'leather-styles/jsx';

import { Link } from '@leather.io/ui';

import {
  type MailKind,
  complianceEmail,
  getBackupWalletNames,
  getMailto,
  mockWallets,
} from '../compliance-shared/compliance-content';
import {
  BrowserTabFrame,
  ExtensionFrame,
  surfaceLabels,
} from '../compliance-shared/compliance-frames';
import {
  ComplianceActionsProvider,
  type ComplianceTarget,
} from '../compliance-shared/compliance-screen-parts';
import {
  ApproveTransactionScreen,
  LockoutScreen,
  SendReviewScreen,
  WhyLockedScreen,
} from '../compliance-shared/compliance-screens';
import { CopyDeck } from './compliance-copy-deck';
import {
  MobileLockoutScreen,
  MobileSendReviewScreen,
  MobileWhyLockedScreen,
  PhoneFrame,
} from './compliance-mobile';
import { Board, NotesGrid, Section, Variant } from './compliance-ui-board';

const sections = [
  { id: 'lockout', label: 'Lockout' },
  { id: 'why-locked', label: 'Why Leather is locked' },
  { id: 'refusals', label: 'Refusals' },
  { id: 'screening', label: 'Screening in progress' },
  { id: 'no-answer', label: 'No answer' },
  { id: 'reused', label: 'Reused, no new UI' },
  { id: 'copy-deck', label: 'Copy deck' },
];

const mobileLabel = 'Mobile · approximation; built natively in apps/mobile';
const mobileSurface = 'Phone · 390 × 844';

const targetSections: Record<ComplianceTarget, string> = {
  lockout: 'lockout',
  'why-created': 'why-locked',
  'key-backup': 'reused',
};

// The screens' own links jump to the matching section; email CTAs open the real mailto: draft.
const boardActions = {
  goTo(target: ComplianceTarget) {
    document.getElementById(targetSections[target])?.scrollIntoView({ behavior: 'smooth' });
  },
  openMail(kind: MailKind) {
    window.location.href = getMailto(kind);
  },
};

function pinNoAnswer() {
  return undefined;
}

// mockWallets: Wallet 1 and 3 created, Wallet 2 imported, plus a Ledger.
const multiWalletCaption = 'Wallets 1 and 3 created, Wallet 2 imported, plus a Ledger.';

function BoardHeader() {
  return (
    <Stack gap="space.04" maxWidth="76ch">
      <Stack gap="space.02">
        <styled.span textStyle="label.03" color="ink.text-subdued">
          Design handoff · extension and mobile
        </styled.span>
        <styled.h1 textStyle="heading.03">Compliance UI</styled.h1>
      </Stack>
      <styled.p textStyle="body.02" color="ink.text-secondary">
        Every new or changed screen for the agreed compliance model (Nov 2 sync, signed off by Rena
        on Nov 4), each variant side by side on one page, with its copy and build notes. Static mock
        data: no screening calls, no autoplay, skeletons frozen. Screens are the same components the
        walkthrough demo renders; mobile frames are web approximations.
      </styled.p>
      <styled.p textStyle="body.02" color="ink.text-secondary">
        For the flows in motion (onboarding, Home, the send form and the email drafts), see the
        walkthrough demo at{' '}
        <Link href="/playground/compliance-states">/playground/compliance-states</Link>.
      </styled.p>
      <styled.nav display="flex" gap="space.02" flexWrap="wrap" aria-label="Sections">
        {sections.map(section => (
          <styled.a
            key={section.id}
            href={`#${section.id}`}
            textStyle="label.03"
            px="space.03"
            py="space.01"
            borderRadius="round"
            borderWidth={1}
            borderColor="ink.border-default"
            bg="ink.background-primary"
            _hover={{ bg: 'ink.component-background-hover' }}
          >
            {section.label}
          </styled.a>
        ))}
      </styled.nav>
    </Stack>
  );
}

export function ComplianceUiPage() {
  return (
    <ComplianceActionsProvider value={boardActions}>
      <Box
        minHeight="100vh"
        bg="ink.background-secondary"
        px="space.09"
        pt="space.09"
        pb="space.11"
        // Static board: freeze the skeleton shimmer.
        css={{ '& [data-state=loading]': { animation: 'none' } }}
        data-testid="compliance-ui-board"
      >
        <Stack gap="space.11" maxWidth="1440px" mx="auto">
          <BoardHeader />

          <Section
            id="lockout"
            title="Lockout"
            description="Whole-app lockout over every wallet, no balances. The same screen whether background screening, an own address on the send review, or a Stacks request from an account with a flagged BTC address set the locked flag. Two ways out: “Why am I seeing this?” and “Dispute this”."
          >
            <Board label="Extension">
              <Variant label="Popup" surface={surfaceLabels.popup}>
                <ExtensionFrame surface="popup">
                  <LockoutScreen />
                </ExtensionFrame>
              </Variant>
              <Variant label="Request window" surface={surfaceLabels['request-window']}>
                <ExtensionFrame surface="request-window">
                  <LockoutScreen />
                </ExtensionFrame>
              </Variant>
              <Variant
                label="Full-page tab"
                surface={surfaceLabels.tab}
                caption="No popup header; content centred at 440px."
              >
                <BrowserTabFrame>
                  <LockoutScreen layout="full" />
                </BrowserTabFrame>
              </Variant>
            </Board>
            <Board label={mobileLabel}>
              <Variant
                label="Full screen"
                surface={mobileSurface}
                caption="Same sticker, CTAs at the bottom. No tab bar, no header."
              >
                <PhoneFrame>
                  <MobileLockoutScreen />
                </PhoneFrame>
              </Variant>
            </Board>
            <NotesGrid
              ids={[
                'background-screening',
                'lockout',
                'send-review-own-flagged',
                'approval-own-btc-flagged',
                'mobile',
              ]}
            />
          </Section>

          <Section
            id="why-locked"
            title="Why Leather is locked"
            description="Opened from “Why am I seeing this?”. A plain explanation, plus one “Back up <wallet> Secret Key” link per software wallet created in Leather. Imported and Ledger wallets get no link."
          >
            <Board label="Extension">
              <Variant
                label="Created software wallet"
                surface={surfaceLabels.popup}
                caption="Wallet 1 was created in Leather: one backup link."
              >
                <ExtensionFrame surface="popup">
                  <WhyLockedScreen backupWalletNames={['Wallet 1']} />
                </ExtensionFrame>
              </Variant>
              <Variant
                label="Imported wallet"
                surface={surfaceLabels.popup}
                caption="The user typed the Secret Key in: no link."
              >
                <ExtensionFrame surface="popup">
                  <WhyLockedScreen backupWalletNames={[]} />
                </ExtensionFrame>
              </Variant>
              <Variant
                label="Multiple wallets, incl. a Ledger"
                surface={surfaceLabels.popup}
                caption={multiWalletCaption}
              >
                <ExtensionFrame surface="popup">
                  <WhyLockedScreen backupWalletNames={getBackupWalletNames(mockWallets)} />
                </ExtensionFrame>
              </Variant>
            </Board>
            <Board label={mobileLabel}>
              <Variant
                label="Created software wallet"
                surface={mobileSurface}
                caption="Back returns to the lockout. Backup opens the existing View Secret Key screen."
              >
                <PhoneFrame>
                  <MobileWhyLockedScreen backupWalletNames={['Wallet 1']} />
                </PhoneFrame>
              </Variant>
            </Board>
            <NotesGrid ids={['why-locked-created', 'why-locked-imported']} />
          </Section>

          <Section
            id="refusals"
            title="Refusals on review and approval"
            description="A restricted counterparty refuses only this transaction; the app stays usable. The refusal callout shows before the user can sign, and the primary action becomes Close."
          >
            <Board label="Extension">
              <Variant
                label="Send review · recipient flagged"
                surface={surfaceLabels.popup}
                caption="Callout replaces the amount. Confirm → Close."
              >
                <ExtensionFrame surface="popup">
                  <SendReviewScreen verdict="recipient-flagged" isScreening={false} />
                </ExtensionFrame>
              </Variant>
              <Variant
                label="Multisig · member flagged"
                surface={surfaceLabels.popup}
                caption="Refused at first proposal. Propose → Close."
              >
                <ExtensionFrame surface="popup">
                  <SendReviewScreen verdict="member-flagged" isScreening={false} />
                </ExtensionFrame>
              </Variant>
              <Variant
                label="dApp approval · counterparty flagged"
                surface={surfaceLabels['request-window']}
                caption="Callout above the details. Close only."
              >
                <ExtensionFrame surface="request-window">
                  <ApproveTransactionScreen verdict="counterparty-flagged" isScreening={false} />
                </ExtensionFrame>
              </Variant>
            </Board>
            <Board label={mobileLabel}>
              <Variant
                label="Send review · recipient flagged"
                surface={`${mobileSurface} · send sheet`}
                caption="Callout replaces “You’ll send”. Cancel / Approve → Close."
              >
                <PhoneFrame variant="sheet">
                  <MobileSendReviewScreen state="recipient-flagged" />
                </PhoneFrame>
              </Variant>
            </Board>
            <NotesGrid
              ids={[
                'send-review-recipient-flagged',
                'multisig-member-flagged',
                'approval-counterparty-flagged',
                'mobile',
              ]}
            />
          </Section>

          <Section
            id="screening"
            title="Screening in progress"
            description="Screening runs as the review or approval opens. Details render as usual; the footer actions are skeletons until a verdict comes back, so nothing can be signed without one. Frozen here; the shipped skeleton shimmers."
          >
            <Board label="Extension">
              <Variant
                label="Send review · screening"
                surface={surfaceLabels.popup}
                caption="One skeleton where Confirm goes."
              >
                <ExtensionFrame surface="popup">
                  <SendReviewScreen verdict="recipient-flagged" isScreening />
                </ExtensionFrame>
              </Variant>
              <Variant
                label="dApp approval · screening"
                surface={surfaceLabels['request-window']}
                caption="Two skeletons where Cancel / Confirm go."
              >
                <ExtensionFrame surface="request-window">
                  <ApproveTransactionScreen verdict="clean" isScreening />
                </ExtensionFrame>
              </Variant>
            </Board>
            <Board label={mobileLabel}>
              <Variant
                label="Send review · screening"
                surface={`${mobileSurface} · send sheet`}
                caption="Skeletons where Cancel / Approve go."
              >
                <PhoneFrame variant="sheet">
                  <MobileSendReviewScreen state="screening" />
                </PhoneFrame>
              </Variant>
            </Board>
            <NotesGrid ids={['send-review-screening', 'approval-screening']} />
          </Section>

          <Section
            id="no-answer"
            title="No answer"
            description="No provider answered, or the request failed. Signing is blocked: a general notice sits above the footer, “contact support” opens a pre-filled email, and Try again reruns the check."
          >
            <Board label="Extension">
              <Variant label="Send review · no answer" surface={surfaceLabels.popup}>
                <ExtensionFrame surface="popup">
                  <SendReviewScreen verdict="no-answer" isScreening={false} onRetry={pinNoAnswer} />
                </ExtensionFrame>
              </Variant>
              <Variant label="dApp approval · no answer" surface={surfaceLabels['request-window']}>
                <ExtensionFrame surface="request-window">
                  <ApproveTransactionScreen
                    verdict="no-answer"
                    isScreening={false}
                    onRetry={pinNoAnswer}
                  />
                </ExtensionFrame>
              </Variant>
            </Board>
            <Board label={mobileLabel}>
              <Variant label="Send review · no answer" surface={`${mobileSurface} · send sheet`}>
                <PhoneFrame variant="sheet">
                  <MobileSendReviewScreen state="no-answer" />
                </PhoneFrame>
              </Variant>
            </Board>
            <NotesGrid ids={['send-review-no-answer', 'approval-no-answer', 'mobile']} />
          </Section>

          <Section
            id="reused"
            title="Reused, no new UI"
            description="Two exits from the lockout that need routing, not screens."
          >
            <Stack gap="space.04" maxWidth="76ch" data-testid="compliance-ui-reused">
              <Stack gap="space.01">
                <styled.h3 textStyle="label.02">Key backup</styled.h3>
                <styled.p textStyle="body.02" color="ink.text-secondary">
                  “Back up &lt;wallet&gt; Secret Key” reuses the existing View Secret Key flow:
                  extension <styled.code textStyle="code">pages/view-secret-key</styled.code>{' '}
                  (RouteUrls.ViewSecretKey, state: {'{ fingerprint }'}), mobile{' '}
                  <styled.code textStyle="code">
                    /settings/wallet/configure/[wallet]/view-secret-key
                  </styled.code>
                  . The lockout has to let that one route through; Back returns to the lockout.
                </styled.p>
              </Stack>
              <Stack gap="space.01">
                <styled.h3 textStyle="label.02">Dispute and support</styled.h3>
                <styled.p textStyle="body.02" color="ink.text-secondary">
                  “Dispute this” and “contact support” are mailto: links to{' '}
                  <styled.code textStyle="code">{complianceEmail}</styled.code> with a pre-filled
                  subject and body (drafts in the copy deck below). No in-app form.
                </styled.p>
              </Stack>
            </Stack>
            <NotesGrid ids={['key-backup', 'dispute']} />
          </Section>

          <Section
            id="copy-deck"
            title="Copy deck"
            description="Every user-facing string from compliance-shared/compliance-content.ts, grouped by screen. Keys match the exports so strings can be traced back to the code."
          >
            <CopyDeck />
          </Section>
        </Stack>
      </Box>
    </ComplianceActionsProvider>
  );
}
