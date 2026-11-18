import { type ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { StakingPoolAvatar } from '~/pages/bitcoin-staking/components/staking-pool-avatar';

import { Badge } from '@leather.io/ui';

const signerManagerGroupName = 'signerManager';

export interface SignerManagerOption {
  providerId: string;
  name: string;
  meta: string;
  isCurrent?: boolean;
  isCustom?: boolean;
  mono?: boolean;
}

interface SignerManagerOptionRowProps {
  option: SignerManagerOption;
  isSelected: boolean;
  onSelect(): void;
  expandedContent?: ReactNode;
}

function SignerManagerOptionRow({
  option,
  isSelected,
  onSelect,
  expandedContent,
}: SignerManagerOptionRowProps) {
  return (
    <styled.label
      position="relative"
      display="flex"
      flexDirection="column"
      borderWidth="1px"
      borderStyle={option.isCustom && !isSelected ? 'dashed' : 'solid'}
      borderRadius="sm"
      bg="ink.background-primary"
      borderColor={isSelected ? 'ink.action-primary-default' : 'ink.border-default'}
      boxShadow={isSelected ? 'inset 0 0 0 1px {colors.ink.action-primary-default}' : 'none'}
      cursor="pointer"
      _hover={isSelected ? undefined : { bg: 'ink.component-background-hover' }}
      data-testid={`signer-manager-option-${option.providerId}`}
    >
      <styled.input
        type="radio"
        name={signerManagerGroupName}
        checked={isSelected}
        onChange={onSelect}
        position="absolute"
        opacity={0}
        width="1px"
        height="1px"
        pointerEvents="none"
      />
      <Flex alignItems="center" gap="space.03" p="space.04" width="100%">
        <Flex flexShrink={0}>
          <StakingPoolAvatar providerId={option.providerId} size="sm" />
        </Flex>
        <styled.span
          textStyle={option.mono ? 'caption.01' : 'label.02'}
          fontFamily={option.mono ? 'monospace' : undefined}
          whiteSpace={option.mono ? 'nowrap' : undefined}
          color="ink.text-primary"
        >
          {option.name}
        </styled.span>
        {option.isCurrent && (
          <Badge label="Current" color="ink.text-subdued" ml={option.meta ? undefined : 'auto'} />
        )}
        {option.meta && !expandedContent && (
          <styled.span
            textStyle="caption.01"
            color="ink.text-subdued"
            ml="auto"
            flexShrink={0}
            textAlign="right"
          >
            {option.meta}
          </styled.span>
        )}
      </Flex>
      {expandedContent && (
        <Box px="space.01" pb="space.01" width="100%">
          {expandedContent}
        </Box>
      )}
    </styled.label>
  );
}

interface ChooseSignerManagerProps {
  options: SignerManagerOption[];
  selectedProviderId: string;
  onSelect(providerId: string): void;
  customEntry?: ReactNode;
}

export function ChooseSignerManager({
  options,
  selectedProviderId,
  onSelect,
  customEntry,
}: ChooseSignerManagerProps) {
  return (
    <Flex role="radiogroup" aria-label="Signer manager" direction="column" gap="space.02">
      {options.map(option => (
        <SignerManagerOptionRow
          key={option.providerId}
          option={option}
          isSelected={option.providerId === selectedProviderId}
          onSelect={() => onSelect(option.providerId)}
          expandedContent={
            option.isCustom && option.providerId === selectedProviderId ? customEntry : undefined
          }
        />
      ))}
    </Flex>
  );
}
