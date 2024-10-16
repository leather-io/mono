import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { Flag, ItemLayout } from '@leather.io/ui/native';

import { Balance } from '../../balance/balance';
import { Widget, WidgetHeader } from '../components/widget';
import { getChainName } from './get-chain-name';
import { TokensIcon } from './tokens-icon';
import { Token } from './types';

interface TokensWidgetProps {
  tokens: Token[];
  totalBalance: Money;
}

export function TokensWidget({ tokens, totalBalance }: TokensWidgetProps) {
  return (
    <Widget
      header={
        <WidgetHeader
          title={t({
            id: 'tokens.header_title',
            message: 'My tokens',
          })}
          totalBalance={totalBalance}
        />
      }
    >
      {tokens.map(
        ({ availableBalance: { availableBalance }, tokenName, ticker, chain, fiatBalance }) => (
          <Flag
            key={ticker}
            img={<TokensIcon ticker={ticker} />}
            align="middle"
            spacing="1"
            reverse={false}
          >
            <ItemLayout
              titleLeft={tokenName}
              titleRight={availableBalance && <Balance balance={availableBalance} />}
              captionLeft={getChainName(chain)}
              captionRight={<Balance balance={fiatBalance} color="ink.text-subdued" />}
            />
          </Flag>
        )
      )}
    </Widget>
  );
}
