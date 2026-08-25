import { useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import {
  ChooseSignerManager,
  type SignerManagerOption,
} from '~/features/bitcoin-staking/update-staking/components/choose-signer-manager';
import {
  SidebarSummaryCard,
  type SidebarSummaryRow,
} from '~/features/bitcoin-staking/update-staking/components/sidebar-summary-card';

import { Button, CheckmarkIcon, Input } from '@leather.io/ui';

const listedCurrentProviderId = 'stackingDao';
const currentCustomProviderId = 'currentCustom';
const customProviderId = 'custom';

const currentCustomContractLabel = 'SP4SZE…3NKD.custom-signer-manager';
const listedDemoContractSnippet = 'fast-pool';
const notFoundDemoSuffix = '.not-found';
const validationDelayMs = 900;

type CustomValidation = 'idle' | 'checking' | 'valid' | 'invalid-format' | 'not-found';

interface PreviewPoolFacts {
  name: string;
  feePercent: number;
  rewardsLabel: string;
}

const previewPoolFacts: Record<string, PreviewPoolFacts> = {
  stackingDao: { name: 'Stacking DAO', feePercent: 0, rewardsLabel: 'sBTC' },
  fastPool: { name: 'Fast Pool', feePercent: 0, rewardsLabel: 'sBTC / BTC' },
  xversePool: { name: 'Xverse', feePercent: 4.95, rewardsLabel: 'sBTC / BTC' },
  senseiNode: { name: 'SenseiNode', feePercent: 10, rewardsLabel: 'sBTC / BTC' },
};

function formatFee(feePercent: number) {
  return `${feePercent}%`;
}

function truncateContract(contractId: string) {
  if (contractId.length <= 28) return contractId;
  return `${contractId.slice(0, 8)}…${contractId.slice(-14)}`;
}

function buildOptions(currentIsCustom: boolean): SignerManagerOption[] {
  const poolOptions = Object.entries(previewPoolFacts).map(([providerId, facts]) => ({
    providerId,
    name: facts.name,
    meta: `${formatFee(facts.feePercent)} fee · ${facts.rewardsLabel}`,
    isCurrent: !currentIsCustom && providerId === listedCurrentProviderId,
  }));

  const customEntryOption: SignerManagerOption = {
    providerId: customProviderId,
    name: currentIsCustom ? 'Different custom contract' : 'Custom signer manager',
    meta: 'Enter a contract address',
    isCustom: true,
  };

  if (!currentIsCustom) return [...poolOptions, customEntryOption];

  return [
    {
      providerId: currentCustomProviderId,
      name: currentCustomContractLabel,
      meta: '',
      isCurrent: true,
      mono: true,
    },
    ...poolOptions,
    customEntryOption,
  ];
}

interface SummaryRowsInput {
  selectedProviderId: string;
  currentProviderId: string;
  currentName: string;
  currentFacts: PreviewPoolFacts | null;
  customValidation: CustomValidation;
  customContract: string;
}

function buildSummaryRows({
  selectedProviderId,
  currentProviderId,
  currentName,
  currentFacts,
  customValidation,
  customContract,
}: SummaryRowsInput): SidebarSummaryRow[] {
  const effectiveRow: SidebarSummaryRow = {
    kind: 'value',
    label: 'Effective',
    value: 'Cycle 114, in 12 days',
    caption: 'One transaction, no unstaking needed',
  };
  const amountRow: SidebarSummaryRow = {
    kind: 'value',
    label: 'Amount staked',
    value: '3,210 STX, moves in full',
  };
  const lockRow: SidebarSummaryRow = {
    kind: 'diff',
    label: 'Locked until',
    from: 'Cycle 122',
    to: 'Cycle 124',
  };

  if (selectedProviderId === customProviderId) {
    if (customValidation !== 'valid') {
      return [
        {
          kind: 'value',
          label: 'Signer manager',
          value: 'Enter a contract address to validate',
        },
      ];
    }
    return [
      { kind: 'diff', label: 'Pool', from: currentName, to: truncateContract(customContract) },
      { kind: 'value', label: 'Rewards token', value: 'Set by the custom contract' },
      amountRow,
      lockRow,
      effectiveRow,
    ];
  }

  if (selectedProviderId === currentProviderId) {
    return [
      { kind: 'diff', label: 'Amount staked', from: '3,200 STX', to: '3,210 STX' },
      lockRow,
      effectiveRow,
    ];
  }

  const target = previewPoolFacts[selectedProviderId];
  const rows: SidebarSummaryRow[] = [
    { kind: 'diff', label: 'Pool', from: currentName, to: target.name },
  ];

  if (currentFacts && target.feePercent !== currentFacts.feePercent) {
    rows.push({
      kind: 'diff',
      label: 'Fee',
      from: formatFee(currentFacts.feePercent),
      to: formatFee(target.feePercent),
      isCritical: target.feePercent > currentFacts.feePercent,
    });
  }

  if (currentFacts && target.rewardsLabel !== currentFacts.rewardsLabel) {
    rows.push({
      kind: 'diff',
      label: 'Rewards token',
      from: currentFacts.rewardsLabel,
      to: target.rewardsLabel,
    });
  }

  if (!currentFacts) {
    rows.push({
      kind: 'diff',
      label: 'Rewards token',
      from: 'Set by the contract',
      to: target.rewardsLabel,
    });
  }

  rows.push(amountRow, lockRow, effectiveRow);
  return rows;
}

interface CustomContractEntryProps {
  contract: string;
  validation: CustomValidation;
  onChange(contract: string): void;
  onValidate(): void;
}

function CustomContractEntry({
  contract,
  validation,
  onChange,
  onValidate,
}: CustomContractEntryProps) {
  return (
    <Stack gap="space.02" p="space.03" borderRadius="sm" bg="ink.background-secondary">
      <styled.input
        id="customSignerManagerContract"
        autoFocus
        placeholder="Enter a contract address"
        value={contract}
        onChange={input => onChange(input.target.value)}
        disabled={validation === 'checking'}
        width="100%"
        height="32px"
        px="space.03"
        borderRadius="sm"
        borderWidth="1px"
        borderStyle="solid"
        borderColor={
          validation === 'invalid-format' || validation === 'not-found'
            ? 'red.action-primary-default'
            : 'ink.border-default'
        }
        bg="ink.background-primary"
        textStyle="caption.01"
        fontFamily="monospace"
        _focusVisible={{ outline: 'none', borderColor: 'ink.action-primary-default' }}
      />
      {validation === 'invalid-format' && (
        <ErrorLabel textStyle="caption.01" fontSize="12px" lineHeight="16px">
          That doesn&apos;t look like a signer-manager contract address
        </ErrorLabel>
      )}
      {validation === 'not-found' && (
        <ErrorLabel textStyle="caption.01" fontSize="12px" lineHeight="16px">
          No signer-manager contract found at that address
        </ErrorLabel>
      )}
      <Flex justifyContent="flex-end">
        {validation === 'valid' ? (
          <Button size="sm" variant="outline" disabled>
            <Flex alignItems="center" gap="space.01">
              <CheckmarkIcon
                variant="small"
                width={12}
                height={12}
                color="ink.text-non-interactive"
              />
              <span>Contract valid</span>
            </Flex>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={contract.length === 0 || validation === 'checking'}
            aria-busy={validation === 'checking' || undefined}
            _loading={{
              _after: {
                width: '14px',
                height: '14px',
                left: 'calc(50% - 7px)',
                top: 'calc(50% - 7px)',
              },
            }}
            onClick={onValidate}
          >
            {validation === 'checking' ? 'Validating…' : 'Validate contract'}
          </Button>
        )}
      </Flex>
    </Stack>
  );
}

interface SwitchSignerManagerPreviewProps {
  initialProviderId: string;
  currentIsCustom?: boolean;
}

export function SwitchSignerManagerPreview({
  initialProviderId,
  currentIsCustom = false,
}: SwitchSignerManagerPreviewProps) {
  const currentProviderId = currentIsCustom ? currentCustomProviderId : listedCurrentProviderId;
  const currentFacts = currentIsCustom ? null : previewPoolFacts[listedCurrentProviderId];
  const currentName = currentIsCustom
    ? truncateContract(currentCustomContractLabel)
    : previewPoolFacts[listedCurrentProviderId].name;

  const [selectedProviderId, setSelectedProviderId] = useState(initialProviderId);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [customContract, setCustomContract] = useState('');
  const [customValidation, setCustomValidation] = useState<CustomValidation>('idle');

  const isCustomSelected = selectedProviderId === customProviderId;
  const isSwitchingToPool = selectedProviderId !== currentProviderId && !isCustomSelected;
  const isSwitchingToCustom = isCustomSelected && customValidation === 'valid';

  function handleSelect(providerId: string) {
    setSelectedProviderId(providerId);
    setTermsAccepted(false);
    setHasConfirmed(false);
  }

  function handleContractChange(contract: string) {
    setCustomContract(contract);
    setCustomValidation('idle');
    setTermsAccepted(false);
  }

  function handleValidate() {
    if (!customContract.includes('.')) {
      setCustomValidation('invalid-format');
      return;
    }
    setCustomValidation('checking');
    setTimeout(() => {
      if (customContract.includes(listedDemoContractSnippet)) {
        setCustomValidation('idle');
        setCustomContract('');
        setSelectedProviderId('fastPool');
        return;
      }
      if (customContract.endsWith(notFoundDemoSuffix)) {
        setCustomValidation('not-found');
        return;
      }
      setCustomValidation('valid');
    }, validationDelayMs);
  }

  function terms() {
    if (isSwitchingToPool) {
      return {
        label: `I have read and accepted ${previewPoolFacts[selectedProviderId].name}'s terms and conditions`,
        accepted: termsAccepted,
        onToggleAccepted: () => setTermsAccepted(accepted => !accepted),
      };
    }
    if (isSwitchingToCustom) {
      return {
        label:
          'I understand this is a custom signer-manager contract and rewards depend on its policies',
        accepted: termsAccepted,
        onToggleAccepted: () => setTermsAccepted(accepted => !accepted),
      };
    }
    return undefined;
  }

  function confirmLabel() {
    if (isCustomSelected && customValidation !== 'valid') return 'Validate contract first';
    if (isSwitchingToPool || isSwitchingToCustom) return 'Confirm switch';
    return 'Confirm update';
  }

  const confirmDisabled =
    ((isSwitchingToPool || isSwitchingToCustom) && !termsAccepted) ||
    (isCustomSelected && customValidation !== 'valid');

  return (
    <Stack gap="space.05">
      <styled.h1 textStyle="heading.04">Update stake</styled.h1>
      <Flex gap="space.07" alignItems="flex-start" flexWrap="wrap">
        <Stack gap="space.05" flex={1} minWidth="360px" maxWidth="500px">
          <Input.Root data-shrink>
            <Input.Label>Cycles to extend</Input.Label>
            <Input.Field id="previewCyclesToExtend" readOnly value="2" />
          </Input.Root>

          <Input.Root data-shrink>
            <Input.Label>Additional STX to lock (optional)</Input.Label>
            <Input.Field id="previewAmountIncrease" readOnly value="10" />
          </Input.Root>

          <Stack gap="space.02">
            <styled.p textStyle="label.02">Signer manager</styled.p>
            <ChooseSignerManager
              options={buildOptions(currentIsCustom)}
              selectedProviderId={selectedProviderId}
              onSelect={handleSelect}
              customEntry={
                <CustomContractEntry
                  contract={customContract}
                  validation={customValidation}
                  onChange={handleContractChange}
                  onValidate={handleValidate}
                />
              }
            />
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              Picking a different pool moves your whole position at the start of the next cycle.
              You&apos;ll accept the new pool&apos;s terms before confirming.
            </styled.p>
          </Stack>
        </Stack>

        <Box width="320px" flexShrink={0}>
          <SidebarSummaryCard
            rows={buildSummaryRows({
              selectedProviderId,
              currentProviderId,
              currentName,
              currentFacts,
              customValidation,
              customContract,
            })}
            terms={terms()}
            confirmLabel={confirmLabel()}
            confirmDisabled={confirmDisabled}
            isBusy={isCustomSelected && customValidation === 'checking'}
            onConfirm={() => setHasConfirmed(true)}
          />
          {hasConfirmed && (
            <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.02">
              Nothing is submitted from the playground; in the real form this signs one stake-update
              transaction.
            </styled.p>
          )}
        </Box>
      </Flex>
    </Stack>
  );
}
