import { type RefObject } from 'react';

import { useComposedRefs } from 'framer-motion';
import { Flex, styled } from 'leather-styles/jsx';

import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import { useAmountField } from '@leather.io/ui';

import { resolveAmountFieldColors } from './amount-field-colors';

interface PrimaryValueProps {
  asset: SwappableFungibleCryptoAsset | undefined;
  value: string;
  onChange(value: string): void;
  invalid: boolean;
  currency?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function PrimaryValue({
  asset,
  value,
  onChange,
  inputRef,
  invalid,
  currency,
}: PrimaryValueProps) {
  const { ref, inputProps, touched, currencySign } = useAmountField({
    value,
    onChange,
    maxDecimals: asset?.decimals ?? 16,
    enableGrouping: false,
    currency,
  });
  const { textColor, caretColor, symbolColor } = resolveAmountFieldColors(
    asset,
    value,
    touched,
    invalid
  );
  const composedRef = useComposedRefs(ref, inputRef);

  return (
    // Maintain the 32px tall layout but reduce the line height of the input to 28px to shorten the caret.
    <Flex direction="column" alignItems="center" height={32} width="100%">
      <Flex alignItems="center" width="100%">
        {currencySign && <CurrencySymbol color={symbolColor}>{currencySign.symbol}</CurrencySymbol>}
        <styled.input
          ref={composedRef}
          autoCapitalize="off"
          autoComplete="off"
          inputMode="decimal"
          textStyle="heading.03"
          fontSize={26}
          lineHeight="28px"
          outline="none"
          autoFocus
          placeholder="0"
          width="100%"
          minWidth={0}
          style={{ caretColor, color: textColor }}
          transition="color 0.2s ease"
          {...inputProps}
        />
      </Flex>
    </Flex>
  );
}

function CurrencySymbol({ color, children }: { color: string; children: string }) {
  return (
    <styled.span
      textStyle="heading.03"
      fontSize={26}
      lineHeight="28px"
      transition="color 0.2s ease"
      style={{ color }}
    >
      {children}
    </styled.span>
  );
}
