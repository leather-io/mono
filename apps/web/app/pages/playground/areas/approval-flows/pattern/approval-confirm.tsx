import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Button, CheckmarkIcon, Switch } from '@leather.io/ui';

import { useApprovalDirection } from './approval-direction';
import { useApprovalLaunching } from './approval-launch';
import { approvalInteractiveTrigger, approvalSurface } from './approval-surface';

interface ApprovalHoldConfirmation {
  mode: 'hold';
  label?: string;
}

interface ApprovalAcknowledgeConfirmation {
  mode: 'acknowledge';
  statement: string;
}

interface ApprovalRetypeConfirmation {
  mode: 'retype';
  prompt: string;
  value: string;
  start: number;
  length: number;
}

export type ApprovalConfirmation =
  | ApprovalHoldConfirmation
  | ApprovalAcknowledgeConfirmation
  | ApprovalRetypeConfirmation;

type ApprovalPrimaryIntent = 'default' | 'danger';

const clickGuardMs = 600;
const guardStartOpacity = 0.55;
const holdDurationMs = 1200;
const holdDoneResetMs = 1600;
const reducedMotionHoldSteps = 4;
const retypeGroupSize = 4;
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function readServerReducedMotion() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, readReducedMotion, readServerReducedMotion);
}

function useClickGuard(armKey: string, isRequested: boolean) {
  const ref = useRef<HTMLButtonElement>(null);
  const isLaunching = useApprovalLaunching();
  const isEnabled = isRequested && !isLaunching;
  const [armedKey, setArmedKey] = useState<string | undefined>();
  const key = `${String(isEnabled)}|${armKey}`;
  useEffect(() => {
    if (!isEnabled) return undefined;
    const button = ref.current;
    const animation =
      button && !readReducedMotion()
        ? button.animate([{ opacity: guardStartOpacity }, { opacity: 1 }], {
            duration: clickGuardMs,
            easing: 'ease-out',
          })
        : undefined;
    const timeout = window.setTimeout(() => setArmedKey(key), clickGuardMs);
    return () => {
      window.clearTimeout(timeout);
      animation?.cancel();
    };
  }, [key, isEnabled]);
  return { ref, isArmed: isEnabled && armedKey === key };
}

function blockEnter(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key === 'Enter') event.preventDefault();
}

interface PrimaryButtonProps {
  label: string;
  intent: ApprovalPrimaryIntent;
  isDisabled: boolean;
  isBusy?: boolean;
  isFullWidth: boolean;
  armKey: string;
}

function TapPrimaryButton({
  label,
  intent,
  isDisabled,
  isBusy,
  isFullWidth,
  armKey,
}: PrimaryButtonProps) {
  const guard = useClickGuard(armKey, !isDisabled && !isBusy);
  return (
    <Button
      ref={guard.ref}
      size="lg"
      fullWidth={isFullWidth}
      flex={isFullWidth ? undefined : '1'}
      intent={intent}
      disabled={isDisabled}
      aria-busy={isBusy}
      data-click-guard={guard.isArmed ? 'armed' : 'waiting'}
      onKeyDown={blockEnter}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (!guard.isArmed) event.preventDefault();
      }}
    >
      {label}
    </Button>
  );
}

function holdFillWidth(progress: number, isReducedMotion: boolean) {
  const shown = isReducedMotion
    ? Math.floor(progress * reducedMotionHoldSteps) / reducedMotionHoldSteps
    : progress;
  return `${Math.round(shown * 100)}%`;
}

function holdState(isHolding: boolean, isDone: boolean) {
  if (isDone) return 'done';
  return isHolding ? 'holding' : 'idle';
}

interface HoldPrimaryButtonProps extends PrimaryButtonProps {
  holdLabel?: string;
}

function HoldPrimaryButton({
  label,
  holdLabel,
  intent,
  isDisabled,
  isBusy,
  isFullWidth,
  armKey,
}: HoldPrimaryButtonProps) {
  const guard = useClickGuard(armKey, !isDisabled && !isBusy);
  const isReducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const frameRef = useRef<number | undefined>(undefined);
  const startRef = useRef(0);

  function stopFrame() {
    if (frameRef.current !== undefined) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = undefined;
  }

  function tick(now: number) {
    const next = Math.min(1, (now - startRef.current) / holdDurationMs);
    setProgress(next);
    if (next >= 1) {
      stopFrame();
      setIsHolding(false);
      setIsDone(true);
      return;
    }
    frameRef.current = window.requestAnimationFrame(tick);
  }

  function startHold() {
    if (isDisabled || isBusy || isDone || isHolding || !guard.isArmed) return;
    startRef.current = performance.now();
    setIsHolding(true);
    frameRef.current = window.requestAnimationFrame(tick);
  }

  function cancelHold() {
    if (!isHolding) return;
    stopFrame();
    setIsHolding(false);
    setProgress(0);
  }

  useEffect(() => stopFrame, []);

  useEffect(() => {
    if (!isDone) return undefined;
    const timeout = window.setTimeout(() => {
      setIsDone(false);
      setProgress(0);
    }, holdDoneResetMs);
    return () => window.clearTimeout(timeout);
  }, [isDone]);

  return (
    <Button
      ref={guard.ref}
      size="lg"
      fullWidth={isFullWidth}
      flex={isFullWidth ? undefined : '1'}
      intent={intent}
      disabled={isDisabled}
      aria-busy={isBusy}
      overflow="hidden"
      userSelect="none"
      touchAction="none"
      iconStart={isDone ? CheckmarkIcon : undefined}
      data-click-guard={guard.isArmed ? 'armed' : 'waiting'}
      data-hold-state={holdState(isHolding, isDone)}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        if (event.button === 0) startHold();
      }}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onBlur={cancelHold}
      onContextMenu={(event: MouseEvent<HTMLButtonElement>) => event.preventDefault()}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Enter') event.preventDefault();
        if (event.key !== ' ') return;
        event.preventDefault();
        if (!event.repeat) startHold();
      }}
      onKeyUp={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === ' ') cancelHold();
      }}
      onClick={(event: MouseEvent<HTMLButtonElement>) => event.preventDefault()}
    >
      <styled.span
        aria-hidden="true"
        position="absolute"
        top="0"
        bottom="0"
        left="0"
        bg="ink.background-primary"
        opacity={0.28}
        pointerEvents="none"
        style={{
          width: isDone ? '0%' : holdFillWidth(progress, isReducedMotion),
          transition: isHolding || isReducedMotion ? 'none' : 'width 160ms ease-out',
        }}
      />
      <styled.span position="relative">
        {isDone ? label : (holdLabel ?? `Hold to ${label.toLowerCase()}`)}
      </styled.span>
    </Button>
  );
}

interface ApprovalPrimaryButtonProps extends PrimaryButtonProps {
  confirmation?: ApprovalConfirmation;
}

export function ApprovalPrimaryButton({ confirmation, ...props }: ApprovalPrimaryButtonProps) {
  if (confirmation?.mode === 'hold') {
    return <HoldPrimaryButton {...props} holdLabel={confirmation.label} />;
  }
  return <TapPrimaryButton {...props} />;
}

interface AcknowledgeFieldProps {
  statement: string;
  onConfirmedChange(isConfirmed: boolean): void;
}

function AcknowledgeField({ statement, onConfirmedChange }: AcknowledgeFieldProps) {
  const [isChecked, setIsChecked] = useState(false);
  const switchId = useId();
  return (
    <Flex
      alignItems="center"
      gap="space.03"
      px="space.03"
      py="space.03"
      className={approvalSurface.interactive}
      data-approval-zone="confirmation"
    >
      <styled.label
        htmlFor={switchId}
        flex="1"
        minWidth={0}
        textStyle="label.03"
        color="ink.text-primary"
        cursor="pointer"
      >
        {statement}
      </styled.label>
      <Box flexShrink={0} lineHeight={0}>
        <Switch.Root
          id={switchId}
          checked={isChecked}
          onCheckedChange={checked => {
            setIsChecked(checked);
            onConfirmedChange(checked);
          }}
        >
          <Switch.Thumb />
        </Switch.Root>
      </Box>
    </Flex>
  );
}

interface RetypeGroup {
  offset: number;
  text: string;
}

function toRetypeGroups(value: string): RetypeGroup[] {
  return Array.from({ length: Math.ceil(value.length / retypeGroupSize) }, (_, index) => {
    const offset = index * retypeGroupSize;
    return { offset, text: value.slice(offset, offset + retypeGroupSize) };
  });
}

function normaliseRetype(value: string) {
  return value.replace(/\s/g, '').toUpperCase();
}

interface ApprovalHighlightedAddressProps {
  address: string;
  start: number;
  length: number;
}

export function ApprovalHighlightedAddress({
  address,
  start,
  length,
}: ApprovalHighlightedAddressProps) {
  const isHandshake = useApprovalDirection()?.id === 'handshake';
  const end = start + length;
  return (
    <>
      <Flex
        direction="row"
        columnGap="1ch"
        rowGap={isHandshake ? '0' : '2px'}
        flexWrap="wrap"
        aria-hidden="true"
        data-approval-zone="retype-target"
      >
        {toRetypeGroups(address).map((group, groupIndex) => (
          <styled.span
            key={group.offset}
            display="inline-flex"
            textStyle={isHandshake ? 'code' : 'address'}
            color={groupIndex % 2 === 0 ? 'ink.text-primary' : 'ink.text-subdued'}
          >
            {group.text.split('').map((char, index) => {
              const position = group.offset + index;
              const isTarget = position >= start && position < end;
              return (
                <styled.span
                  key={position}
                  color={isTarget ? 'ink.text-primary' : undefined}
                  bg={isTarget ? 'yellow.background-secondary' : undefined}
                  borderBottomWidth={isTarget ? 2 : 0}
                  borderColor="yellow.action-primary-default"
                  fontWeight={isTarget ? 600 : undefined}
                >
                  {char}
                </styled.span>
              );
            })}
          </styled.span>
        ))}
      </Flex>
      <styled.span srOnly>
        {`${address}. Characters ${start + 1} to ${end} are highlighted: ${address.slice(start, end).split('').join(' ')}`}
      </styled.span>
    </>
  );
}

interface RetypeFieldProps {
  confirmation: ApprovalRetypeConfirmation;
  onConfirmedChange(isConfirmed: boolean): void;
}

function RetypeField({ confirmation, onConfirmedChange }: RetypeFieldProps) {
  const { prompt, value, start, length } = confirmation;
  const [typed, setTyped] = useState('');
  const fieldId = useId();
  const expected = normaliseRetype(value.slice(start, start + length));
  const entered = normaliseRetype(typed);
  const isMismatch = entered.length >= expected.length && entered !== expected;
  return (
    <Stack gap="space.01" data-approval-zone="confirmation">
      <Flex alignItems="center" gap="space.03" className={approvalInteractiveTrigger}>
        <styled.label
          htmlFor={fieldId}
          flex="1"
          minWidth={0}
          textStyle="label.03"
          color="ink.text-primary"
        >
          {prompt}
        </styled.label>
        <styled.input
          id={fieldId}
          value={typed}
          maxLength={length}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={isMismatch}
          width="112px"
          height="40px"
          flexShrink={0}
          px="space.03"
          borderWidth={1}
          borderRadius="sm"
          borderColor={isMismatch ? 'red.action-primary-default' : 'ink.border-default'}
          bg="ink.background-primary"
          color="ink.text-primary"
          textStyle="address"
          textAlign="center"
          textTransform="uppercase"
          letterSpacing="0.16em"
          _placeholder={{ color: 'ink.text-non-interactive' }}
          _focus={{ outline: 'none', borderColor: 'ink.action-primary-default' }}
          placeholder={'·'.repeat(length)}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setTyped(event.target.value);
            onConfirmedChange(normaliseRetype(event.target.value) === expected);
          }}
        />
      </Flex>
      {isMismatch && (
        <styled.p textStyle="caption.01" color="red.text-primary" aria-live="polite">
          These don’t match the highlighted characters.
        </styled.p>
      )}
    </Stack>
  );
}

interface ApprovalConfirmationFieldProps {
  confirmation?: ApprovalConfirmation;
  onConfirmedChange(isConfirmed: boolean): void;
}

export function ApprovalConfirmationField({
  confirmation,
  onConfirmedChange,
}: ApprovalConfirmationFieldProps) {
  if (confirmation?.mode === 'acknowledge') {
    return (
      <AcknowledgeField statement={confirmation.statement} onConfirmedChange={onConfirmedChange} />
    );
  }
  if (confirmation?.mode === 'retype') {
    return <RetypeField confirmation={confirmation} onConfirmedChange={onConfirmedChange} />;
  }
  return null;
}

export function needsConfirmationField(confirmation?: ApprovalConfirmation) {
  return confirmation?.mode === 'acknowledge' || confirmation?.mode === 'retype';
}
