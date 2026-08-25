import { Flex, Stack, styled } from 'leather-styles/jsx';
import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';

import { Button, CheckmarkIcon } from '@leather.io/ui';

import { getStateErrorMessage } from '../../byosm/byosm-error-messages';
import { ByosmSignerManagerState } from '../../byosm/use-byosm-signer-manager';

const switchContent = bitcoinStakingContent.switchSignerManager;

interface CustomContractEntryProps {
  value: string;
  state: ByosmSignerManagerState;
  onChange(value: string): void;
  onValidate(): void;
}

export function CustomContractEntry({
  value,
  state,
  onChange,
  onValidate,
}: CustomContractEntryProps) {
  const isChecking = state.status === 'checking';
  const errorMessage = getStateErrorMessage(state);

  return (
    <Stack gap="space.02" p="space.03" borderRadius="sm" bg="ink.background-secondary">
      <styled.input
        id="customSignerManagerContract"
        data-testid="custom-signer-manager-input"
        autoFocus
        autoComplete="off"
        data-1p-ignore
        placeholder={switchContent.inputPlaceholder}
        value={value}
        onChange={input => onChange(input.target.value)}
        disabled={isChecking}
        width="100%"
        height="32px"
        px="space.03"
        borderRadius="sm"
        borderWidth="1px"
        borderStyle="solid"
        borderColor={errorMessage ? 'red.action-primary-default' : 'ink.border-default'}
        bg="ink.background-primary"
        textStyle="caption.01"
        fontFamily="monospace"
        _focusVisible={{ outline: 'none', borderColor: 'ink.action-primary-default' }}
      />
      {errorMessage && (
        <ErrorLabel textStyle="caption.01" fontSize="12px" lineHeight="16px">
          {errorMessage}
        </ErrorLabel>
      )}
      <Flex justifyContent="flex-end">
        {state.status === 'valid' ? (
          <Button size="sm" variant="outline" disabled>
            <Flex alignItems="center" gap="space.01">
              <CheckmarkIcon
                variant="small"
                width={12}
                height={12}
                color="ink.text-non-interactive"
              />
              <span>{switchContent.contractValidLabel}</span>
            </Flex>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={value.length === 0 || isChecking}
            aria-busy={isChecking || undefined}
            _loading={{
              _after: {
                width: '14px',
                height: '14px',
                left: 'calc(50% - 7px)',
                top: 'calc(50% - 7px)',
              },
            }}
            onClick={onValidate}
            data-testid="custom-signer-manager-validate"
          >
            {isChecking ? switchContent.validatingLabel : switchContent.validateLabel}
          </Button>
        )}
      </Flex>
    </Stack>
  );
}
