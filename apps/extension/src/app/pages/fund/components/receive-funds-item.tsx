import QRCodeIcon from '@assets/images/fund/qr-code-icon.png';
import { FundPageSelectors } from '@tests/selectors/fund.selectors';

import { FundAccountTile } from './fund-account-tile';
import { BitcoinIconComponent, StacksIconComponent } from './receive-funds-item.icons';

type FundCurrencySymbol = 'BTC' | 'STX';

interface CryptoDescription {
  title: string;
  IconComponent(): React.JSX.Element;
}

const cryptoDescriptions: Record<FundCurrencySymbol, CryptoDescription> = {
  STX: {
    title: 'Receive STX from a friend or deposit from a separate wallet',
    IconComponent: StacksIconComponent,
  },
  BTC: {
    title: 'Receive BTC from a friend or deposit from a separate wallet',
    IconComponent: BitcoinIconComponent,
  },
};

interface ReceiveFundsItemProps {
  onReceive(): void;
  symbol: FundCurrencySymbol;
}

export function ReceiveFundsItem({ onReceive, symbol }: ReceiveFundsItemProps) {
  return (
    <FundAccountTile
      description={cryptoDescriptions[symbol].title}
      icon={QRCodeIcon}
      onClickTile={onReceive}
      ReceiveStxIcon={cryptoDescriptions[symbol].IconComponent}
      testId={FundPageSelectors.BtnReceiveStx}
    />
  );
}

