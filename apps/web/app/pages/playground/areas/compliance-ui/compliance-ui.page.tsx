import { Box, Stack, styled } from 'leather-styles/jsx';

import { Link } from '@leather.io/ui';

import {
  type MailKind,
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
import { Board, Section, Variant } from './compliance-ui-board';

const sections = [
  { id: 'lockout', label: 'Lockout' },
  { id: 'why-locked', label: 'Why Leather is locked' },
  { id: 'refusals', label: 'Refusals' },
  { id: 'screening', label: 'Screening in progress' },
  { id: 'no-answer', label: 'No answer' },
  { id: 'copy-deck', label: 'Copy deck' },
];

const mobileLabel = 'Mobile · approximation; built natively in apps/mobile';
const mobileSurface = 'Phone · 390 × 844';

const targetSections: Record<ComplianceTarget, string> = {
  lockout: 'lockout',
  'why-created': 'why-locked',
  'key-backup': 'why-locked',
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
        Every new or changed compliance screen, extension and mobile. Static mock data; mobile
        frames are web approximations.
      </styled.p>
      <styled.p textStyle="body.02" color="ink.text-secondary">
        Flows in motion: <Link href="/playground/compliance-states">compliance states</Link>.
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
        data-testid="compliance-ui-board"
      >
        <Stack gap="space.11" maxWidth="1440px" mx="auto">
          <BoardHeader />

          <Section id="lockout" title="Lockout" description="Whole app, every wallet, no balances.">
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
          </Section>

          <Section
            id="why-locked"
            title="Why Leather is locked"
            description="One backup link per wallet created in Leather."
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
          </Section>

          <Section
            id="refusals"
            title="Refusals on review and approval"
            description="Only this transaction is refused; the app stays usable."
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
          </Section>

          <Section
            id="screening"
            title="Screening in progress"
            description="Footer actions shimmer until a verdict comes back."
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
          </Section>

          <Section
            id="no-answer"
            title="No answer"
            description="Nothing is signed without a verdict."
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
          </Section>

          <Section id="copy-deck" title="Copy deck" description="Every string, grouped by screen.">
            <CopyDeck />
          </Section>
        </Stack>
      </Box>
    </ComplianceActionsProvider>
  );
}
