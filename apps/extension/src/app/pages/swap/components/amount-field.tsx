import { Flex, styled } from 'leather-styles/jsx';

import { InputCurrencyMode, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { SecondaryAmount } from '@leather.io/state/swap';
import { ArrowTopBottomIcon } from '@leather.io/ui';

interface AmountFieldProps {
  asset: SwappableFungibleCryptoAsset | undefined;
  value: string;
  secondaryAmount: SecondaryAmount;
  inputCurrencyMode: InputCurrencyMode;
}

export function AmountField({ value }: AmountFieldProps) {
  return (
    <Flex direction="column" gap="space.03">
      <styled.input
        caretColor="red" // TODO: Temp
        textStyle="heading.03"
        fontSize={26}
        lineHeight="32px"
        value={value}
        outline="none"
        autoFocus
      />

      <Flex gap="space.01" alignItems="center">
        <styled.div textStyle="label.03" color="ink.text-subdued">
          $2867.74
        </styled.div>
        <ArrowTopBottomIcon variant="small" color="ink.text-subdued" />
      </Flex>
    </Flex>
  );
}
