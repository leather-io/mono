import {
  Children,
  type ReactNode,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ChevronDownIcon, ChevronUpIcon } from '@leather.io/ui';

import {
  type DirectionIntentProps,
  type DirectionSectionProps,
  isWhatMovesLabel,
  useApprovalDirection,
} from './approval-direction';
import { truncateMiddle } from './approval-format';
import { useApprovalHistoryState } from './approval-history-state';
import { AccountAvatar } from './approval-identity';
import {
  type ApprovalIdentity,
  ApprovalLaunchOverlay,
  ApprovalLaunchStateProvider,
} from './approval-launch';
import { type ApprovalLaunch, useApprovalOptions } from './approval-options';
import { ExactAmount } from './approval-rows';
import { approvalDivider, approvalInteractiveTrigger } from './approval-surface';
import type { ApprovalAccount } from './approval-types';

interface ApprovalSignerValue {
  signer?: ApprovalAccount;
  hasAccountSlot: boolean;
  identity?: ApprovalIdentity;
  intent?: DirectionIntentProps;
  setSigner(account: ApprovalAccount | undefined): void;
  setIdentity(identity: ApprovalIdentity): void;
  setIntent(intent: DirectionIntentProps): void;
}

const ApprovalSignerContext = createContext<ApprovalSignerValue>({
  hasAccountSlot: false,
  setSigner() {
    return undefined;
  },
  setIdentity() {
    return undefined;
  },
  setIntent() {
    return undefined;
  },
});

function isSameAccount(a: ApprovalAccount | undefined, b: ApprovalAccount | undefined) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.address === b.address &&
    a.name === b.name &&
    a.signer === b.signer &&
    a.vault?.name === b.vault?.name
  );
}

export function useApprovalSigner() {
  return useContext(ApprovalSignerContext).signer;
}

export function useApprovalAccountSlot() {
  return useContext(ApprovalSignerContext).hasAccountSlot;
}

function isAccountSlotSection(child: ReactNode) {
  return (
    isValidElement<ApprovalSectionProps>(child) &&
    child.type === ApprovalSection &&
    isWhatMovesLabel(child.props.label)
  );
}

export function useRegisterApprovalSigner(account: ApprovalAccount | undefined) {
  const { setSigner } = useContext(ApprovalSignerContext);
  useEffect(() => {
    setSigner(account);
  }, [account, setSigner]);
}

function isSameIdentity(a: ApprovalIdentity | undefined, b: ApprovalIdentity) {
  return a !== undefined && a.origin === b.origin && isSameAccount(a.account, b.account);
}

function isSameIntent(a: DirectionIntentProps | undefined, b: DirectionIntentProps) {
  return a !== undefined && a.title === b.title && a.kind === b.kind && a.icon === b.icon;
}

export function useRegisterApprovalIdentity(origin: string, account: ApprovalAccount | undefined) {
  const { setIdentity } = useContext(ApprovalSignerContext);
  useLayoutEffect(() => {
    setIdentity({ origin, account });
  }, [origin, account, setIdentity]);
}

export function useRegisterApprovalIntent({ title, kind, icon }: DirectionIntentProps) {
  const { setIntent } = useContext(ApprovalSignerContext);
  useLayoutEffect(() => {
    setIntent({ title, kind, icon });
  }, [title, kind, icon, setIntent]);
}

export function useApprovalRegisteredIntent() {
  return useContext(ApprovalSignerContext).intent;
}

export function useApprovalHasHeader() {
  return useContext(ApprovalSignerContext).identity !== undefined;
}

export const hiddenScrollbar = css({
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
});

interface ApprovalShellProps {
  children: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
}

export function ApprovalShell({ children, footer, overlay }: ApprovalShellProps) {
  const [signer, setSignerState] = useState<ApprovalAccount | undefined>();
  const [identity, setIdentityState] = useState<ApprovalIdentity | undefined>();
  const [intent, setIntentState] = useState<DirectionIntentProps | undefined>();
  const { launch, containers, isConnect } = useApprovalOptions();
  const [finishedLaunch, setFinishedLaunch] = useState<ApprovalLaunch | undefined>();
  const hasAccountSlot = Children.toArray(children).some(isAccountSlotSection);
  const isLaunching = launch !== 'off' && finishedLaunch !== launch;
  return (
    <ApprovalSignerContext.Provider
      value={{
        signer,
        hasAccountSlot,
        identity,
        intent,
        setSigner(account) {
          setSignerState(current => (isSameAccount(current, account) ? current : account));
        },
        setIdentity(next) {
          setIdentityState(current => (isSameIdentity(current, next) ? current : next));
        },
        setIntent(next) {
          setIntentState(current => (isSameIntent(current, next) ? current : next));
        },
      }}
    >
      <ApprovalLaunchStateProvider isLaunching={isLaunching}>
        <Flex
          direction="column"
          height="100%"
          position="relative"
          bg="ink.background-primary"
          color="ink.text-primary"
          data-approval-containers={containers}
        >
          <Box flex="1" minHeight={0} overflowY="auto" className={hiddenScrollbar}>
            {children}
          </Box>
          {footer}
          {overlay}
          {isLaunching && (
            <ApprovalLaunchOverlay
              key={launch}
              launch={launch}
              identity={identity}
              isConnect={isConnect}
              onDone={() => setFinishedLaunch(launch)}
            />
          )}
        </Flex>
      </ApprovalLaunchStateProvider>
    </ApprovalSignerContext.Provider>
  );
}

export function useApprovalTitleFocus() {
  const { isSolo } = useApprovalOptions();
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (isSolo) ref.current?.focus({ preventScroll: true });
  }, [isSolo]);
  return ref;
}

interface ApprovalIntentProps {
  title: string;
  kind?: ReactNode;
  icon?: ReactNode;
}

export function ApprovalIntent({ title, kind, icon }: ApprovalIntentProps) {
  const Intent = useApprovalDirection()?.Intent;
  if (Intent) return <Intent title={title} kind={kind} icon={icon} />;
  return <BaselineIntent title={title} kind={kind} icon={icon} />;
}

function BaselineIntent({ title, kind, icon }: ApprovalIntentProps) {
  const { titleStyle } = useApprovalOptions();
  const titleRef = useApprovalTitleFocus();
  return (
    <Stack gap="space.03" px="space.05" pt="space.05" pb="space.04" data-approval-zone="intent">
      {icon}
      <Stack gap="space.01">
        {titleStyle === 'current' && (
          <styled.h1 ref={titleRef} tabIndex={-1} outline="none" textStyle="heading.03">
            {title}
          </styled.h1>
        )}
        {titleStyle === 'large' && (
          <styled.h1 ref={titleRef} tabIndex={-1} outline="none" textStyle="heading.04">
            {title}
          </styled.h1>
        )}
        {titleStyle === 'marche' && (
          <styled.h1
            ref={titleRef}
            tabIndex={-1}
            outline="none"
            textStyle="heading.03"
            textTransform="none"
            fontSize="24px"
            lineHeight="1.2"
          >
            {title}
          </styled.h1>
        )}
        {titleStyle === 'proposed' && (
          <styled.h1 ref={titleRef} tabIndex={-1} outline="none" textStyle="heading.05">
            {title}
          </styled.h1>
        )}
        {kind && (
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {kind}
          </styled.p>
        )}
      </Stack>
    </Stack>
  );
}

interface ApprovalSectionProps {
  label?: string;
  trailing?: ReactNode;
  children: ReactNode;
  divided?: boolean;
  collapsible?: boolean;
  summary?: ReactNode;
}

function BaselineSection({
  label,
  trailing,
  children,
  divided,
  collapsible,
  summary,
  isOpen,
  onToggle,
}: DirectionSectionProps) {
  return (
    <styled.section
      data-approval-section={label}
      px="space.05"
      py="space.03"
      className={divided ? approvalDivider : undefined}
    >
      {label && collapsible && (
        <styled.button
          type="button"
          display="flex"
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          gap="space.03"
          pb={isOpen ? 'space.02' : '0'}
          minHeight="28px"
          cursor="pointer"
          textAlign="left"
          aria-expanded={isOpen}
          onClick={onToggle}
          className={approvalInteractiveTrigger}
        >
          <styled.h2 textStyle="label.03" color="ink.text-subdued" flexShrink={0}>
            {label}
          </styled.h2>
          <Flex alignItems="center" gap="space.02" minWidth={0}>
            {!isOpen && summary && (
              <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
                {summary}
              </styled.span>
            )}
            {isOpen ? (
              <ChevronUpIcon variant="small" color="ink.text-subdued" />
            ) : (
              <ChevronDownIcon variant="small" color="ink.text-subdued" />
            )}
          </Flex>
        </styled.button>
      )}
      {label && !collapsible && (
        <Flex alignItems="center" justifyContent="space-between" gap="space.02" pb="space.02">
          <styled.h2 textStyle="label.03" color="ink.text-subdued">
            {label}
          </styled.h2>
          {trailing}
        </Flex>
      )}
      {isOpen && <Stack gap="0">{children}</Stack>}
    </styled.section>
  );
}

export function ApprovalSection({
  label,
  trailing,
  children,
  divided,
  collapsible,
  summary,
}: ApprovalSectionProps) {
  const { isDetailsOpen, setDetailsOpen, accountPlacement } = useApprovalOptions();
  const { signer, hasAccountSlot } = useContext(ApprovalSignerContext);
  const direction = useApprovalDirection();
  const Section = direction?.Section ?? BaselineSection;
  const isOpen = !collapsible || isDetailsOpen;
  const showAccount =
    accountPlacement === 'body' && hasAccountSlot && isWhatMovesLabel(label) && signer;
  return (
    <>
      <Section
        label={label}
        trailing={trailing}
        divided={divided}
        collapsible={collapsible}
        summary={summary}
        isOpen={isOpen}
        onToggle={() => setDetailsOpen(!isOpen)}
      >
        {children}
      </Section>
      {showAccount && <ApprovalAccountBlock account={signer} />}
    </>
  );
}

interface ApprovalAccountBlockProps {
  account: ApprovalAccount;
}

function BaselineAccountBlock({ account }: ApprovalAccountBlockProps) {
  const signingVerb = useApprovalHistoryState() ? 'signed' : 'signing';
  const caption = account.vault
    ? `${signingVerb} as ${account.name}`
    : truncateMiddle(account.address, 4);
  return (
    <styled.section px="space.05" py="space.03" data-approval-zone="account">
      <styled.h2 textStyle="label.03" color="ink.text-subdued" pb="space.02">
        With account
      </styled.h2>
      <Flex alignItems="center" gap="space.03" py="space.02">
        <AccountAvatar account={account} size="md" />
        <Stack gap="0" flex="1" minWidth={0}>
          <styled.span textStyle="label.02" truncate>
            {account.vault ? account.vault.name : account.name}
          </styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
            {account.signer === 'ledger' ? `${caption} · Ledger` : caption}
          </styled.span>
        </Stack>
        {account.balance && (
          <Stack gap="0" alignItems="flex-end" textAlign="right" flexShrink={0}>
            <styled.span textStyle="label.02">
              <ExactAmount value={account.balance.amount} symbol={account.balance.symbol} />
            </styled.span>
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {account.balance.fiat ? `Balance · ${account.balance.fiat}` : 'Balance'}
            </styled.span>
          </Stack>
        )}
      </Flex>
    </styled.section>
  );
}

function ApprovalAccountBlock({ account }: ApprovalAccountBlockProps) {
  const Block = useApprovalDirection()?.AccountBlock ?? BaselineAccountBlock;
  return <Block account={account} />;
}
