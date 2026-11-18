import { useId, useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Button, Callout, InfoCircleIcon, Switch, Tooltip } from '@leather.io/ui';

import type { AddressTypeId, AddressTypeSource } from './spending-sources-mock-data';
import {
  type SpendPlan,
  describeCollectibleShortfall,
  findRequiredCollectibleSource,
  formatBtc,
  formatCoinCount,
  getAvailableSats,
  isRequiredToCover,
  planSpend,
} from './spending-sources.utils';

const collectiblesExplainer =
  'Inscriptions and runes live on individual coins. If one of those coins is spent, its inscription or rune goes with it and cannot be recovered.';

// Matches the sheet's space.05 padding, so the tooltip's edges line up with the
// row avatars. Radix takes collision padding as a number, not a token.
const sheetPaddingPx = 24;
// bc1 plus the witness version character: q is SegWit v0, p is Taproot (v1)
const addressTypePrefixLength = 4;
const sharedPrefixLength = 3;

interface AddressPrefixAvatarProps {
  address: string;
}

// The part of the address that tells the types apart, drawn at the size of
// the BtcAvatarIcon it replaces. The shared bc1 recedes; the version character
// that differs carries the weight.
function AddressPrefixAvatar({ address }: AddressPrefixAvatarProps) {
  const prefix = address.slice(0, addressTypePrefixLength);

  return (
    <Flex
      aria-hidden="true"
      alignItems="center"
      justifyContent="center"
      width="48px"
      height="48px"
      borderRadius="round"
      bg="orange.action-primary-default"
      outlineWidth={1}
      outlineStyle="solid"
      outlineOffset={-1}
      outlineColor="ink.border-transparent"
      textStyle="code"
      fontSize="11px"
      color="white"
    >
      <styled.span opacity={0.9}>{prefix.slice(0, sharedPrefixLength)}</styled.span>
      <styled.span fontWeight={600}>{prefix.slice(sharedPrefixLength)}</styled.span>
    </Flex>
  );
}

interface CollectiblesWarningProps {
  tooltipBoundary: HTMLElement | null;
}

function CollectiblesWarning({ tooltipBoundary }: CollectiblesWarningProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <styled.button
          type="button"
          display="inline-flex"
          alignItems="center"
          gap="space.01"
          color="orange.text-primary"
          cursor="help"
        >
          <InfoCircleIcon variant="small" color="orange.text-primary" />
          <styled.span textStyle="caption.01">May hold inscriptions or runes</styled.span>
        </styled.button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        {/* Spans the sheet minus its padding: Radix measures the available width */}
        <Tooltip.Content
          side="top"
          sideOffset={5}
          collisionBoundary={tooltipBoundary}
          collisionPadding={sheetPaddingPx}
          style={{ width: 'var(--radix-tooltip-content-available-width)', maxWidth: 'none' }}
        >
          {collectiblesExplainer}
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface SourceToggleRowProps {
  source: AddressTypeSource;
  isAllowed: boolean;
  isRequired: boolean;
  showRequiredReason: boolean;
  tooltipBoundary: HTMLElement | null;
  onToggle(isAllowed: boolean): void;
}

// An excluded type reads as off, not disabled: its labels drop to the
// non-interactive ink and the avatar fades, but the switch keeps full
// strength so it is obvious it can be turned back on. A required type is the
// opposite: it stays on, its switch is locked, and the row says why, so the
// user never switches into a transfer that cannot be covered.
function SourceToggleRow({
  source,
  isAllowed,
  isRequired,
  showRequiredReason,
  tooltipBoundary,
  onToggle,
}: SourceToggleRowProps) {
  const switchId = useId();

  return (
    <Flex alignItems="center" gap="space.03" py="space.04">
      <Box flexShrink={0} opacity={isAllowed ? 1 : 0.4}>
        <AddressPrefixAvatar address={source.address} />
      </Box>
      <Stack gap="0" flex={1} minWidth={0}>
        <styled.label
          htmlFor={switchId}
          textStyle="label.02"
          color={isAllowed ? 'ink.text-primary' : 'ink.text-non-interactive'}
        >
          {source.label}
        </styled.label>
        <styled.span
          textStyle="caption.01"
          color={isAllowed ? 'ink.text-subdued' : 'ink.text-non-interactive'}
        >
          {formatBtc(getAvailableSats(source))} available · {formatCoinCount(source.coins.length)}
        </styled.span>
        {source.mayHoldCollectibles && (
          <Box pt="space.01">
            <CollectiblesWarning tooltipBoundary={tooltipBoundary} />
          </Box>
        )}
        {isRequired && showRequiredReason && (
          <styled.span
            textStyle="caption.01"
            color={source.mayHoldCollectibles ? 'orange.text-primary' : 'ink.text-subdued'}
            pt="space.01"
          >
            Needed to cover this transfer
          </styled.span>
        )}
      </Stack>
      {/* Switch has no disabled styling of its own yet, so the lock is shown here */}
      <Box
        flexShrink={0}
        opacity={isRequired ? 0.4 : 1}
        cursor={isRequired ? 'not-allowed' : 'auto'}
      >
        <Switch.Root
          id={switchId}
          checked={isAllowed}
          disabled={isRequired}
          onCheckedChange={onToggle}
        >
          <Switch.Thumb />
        </Switch.Root>
      </Box>
    </Flex>
  );
}

interface SpendSummaryProps {
  plan: SpendPlan;
}

function SpendSummary({ plan }: SpendSummaryProps) {
  return (
    <Stack
      gap="0"
      mx="-space.05"
      px="space.05"
      py="space.04"
      borderTopWidth={1}
      borderColor="ink.border-default"
    >
      <styled.span textStyle="label.02">{formatBtc(plan.selectedSats)} selected</styled.span>
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        Fee {formatBtc(plan.feeSats)}
      </styled.span>
    </Stack>
  );
}

interface EditSourcesSheetProps {
  sources: AddressTypeSource[];
  amountSats: number;
  allowed: AddressTypeId[];
  onToggleSource(id: AddressTypeId, isAllowed: boolean): void;
  onCancel(): void;
  onApply(): void;
}

// Rendered inside the popup frame rather than through the real Sheet: Sheet
// portals to document.body and switches to a centred dialog at desktop
// widths, which would cover the whole playground instead of one popup. The
// scrim, surface, radius and shadow use the same tokens as Sheet's drawer.
export function EditSourcesSheet({
  sources,
  amountSats,
  allowed,
  onToggleSource,
  onCancel,
  onApply,
}: EditSourcesSheetProps) {
  const titleId = useId();
  const [sheetElement, setSheetElement] = useState<HTMLDivElement | null>(null);
  const plan = planSpend({ sources, allowed, amountSats });
  const requiredCollectibleSource = findRequiredCollectibleSource({ sources, allowed, amountSats });
  const shortfall =
    requiredCollectibleSource && describeCollectibleShortfall(requiredCollectibleSource, sources);

  return (
    <Box position="absolute" inset={0} zIndex="10">
      <styled.button
        type="button"
        aria-label="Close"
        position="absolute"
        inset={0}
        bg="overlay"
        cursor="default"
        animation="fadein 240ms cubic-bezier(0.16, 1, 0.3, 1)"
        _motionReduce={{ animation: 'none' }}
        onClick={onCancel}
      />
      <Stack
        ref={setSheetElement}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        gap="0"
        p="space.05"
        bg="ink.background-primary"
        borderTopRadius="lg"
        boxShadow="elevation"
        animation="sheetRiseIn 360ms cubic-bezier(0.16, 1, 0.3, 1)"
        _motionReduce={{ animation: 'fadein 240ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <Stack gap="space.01" pb="space.04">
          <styled.h2 id={titleId} textStyle="heading.05">
            Choose where to spend from
          </styled.h2>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            Leather picks coins from the types you allow. Turning one off keeps its coins untouched.
          </styled.p>
        </Stack>

        {shortfall && (
          <Box mx="-space.05" mb="space.04">
            <Callout variant="error" title={shortfall.title}>
              {shortfall.body}
            </Callout>
          </Box>
        )}

        {sources.map(source => (
          <SourceToggleRow
            key={source.id}
            source={source}
            isAllowed={allowed.includes(source.id)}
            isRequired={isRequiredToCover({ id: source.id, sources, allowed, amountSats })}
            showRequiredReason={!shortfall}
            tooltipBoundary={sheetElement}
            onToggle={isAllowed => onToggleSource(source.id, isAllowed)}
          />
        ))}

        <SpendSummary plan={plan} />

        {/* Each button sits in a flex: 1 cell, as in Approver.Actions */}
        <Flex gap="space.04" pt="space.04">
          <Box flex={1}>
            <Button variant="outline" fullWidth onClick={onCancel}>
              Cancel
            </Button>
          </Box>
          <Box flex={1}>
            <Button fullWidth disabled={!plan.isCovered} onClick={onApply}>
              Apply
            </Button>
          </Box>
        </Flex>
      </Stack>
    </Box>
  );
}
