import type React from 'react';

import { SwapSelectors } from '@tests/selectors/swap.selectors';
import { useField } from 'formik';
import { HStack, styled } from 'leather-styles/jsx';

import { Avatar, Button, ChevronDownIcon } from '@leather.io/ui';
import { isString } from '@leather.io/utils';

interface SelectAssetTriggerButtonProps {
  icon?: React.ReactNode;
  name: string;
  onSelectAsset(): void;
  symbol: string;
}
export function SelectAssetTriggerButton({
  icon,
  name,
  onSelectAsset,
  symbol,
}: SelectAssetTriggerButtonProps) {
  const [field] = useField(name);
  const fallback = symbol.slice(0, 2);

  return (
    <Button
      borderRadius="sm"
      data-testid={SwapSelectors.SelectAssetTriggerBtn}
      height="52px"
      onClick={onSelectAsset}
      pl="6px"
      pr="space.03"
      transition="background 100ms ease-in-out"
      variant="ghost"
      {...field}
    >
      <HStack alignItems="center" gap="space.02">
        {icon && isString(icon) ? <Avatar fallback={fallback} image={icon} size="lg" /> : icon}
        <HStack alignItems="center" gap="space.01">
          <styled.span data-testid={SwapSelectors.SelectedAssetSymbol} textStyle="label.01">
            {symbol}
          </styled.span>
          <ChevronDownIcon variant="small" />
        </HStack>
      </HStack>
    </Button>
  );
}
