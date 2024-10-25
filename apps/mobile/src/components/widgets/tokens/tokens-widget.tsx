import React from 'react';

import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { Flag, ItemLayout } from '@leather.io/ui/native';

import { type Token } from '../../../mocks/tokens.mocks';
import { Balance } from '../../balance/balance';
import { Widget, WidgetHeader } from '../components/widget';

interface TokensWidgetProps {
  tokens: Token[];
  totalBalance: Money;
}

function showChain(chain: string) {
  if (chain === 'Stacks blockchain' || chain === 'Bitcoin blockchain') return;
  return chain;
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
        ({
          availableBalance: { availableBalance },
          icon,
          tokenName,
          ticker,
          chain,
          fiatBalance,
        }) => (
          <Flag key={ticker} img={icon} align="middle" spacing="1" reverse={false}>
            <ItemLayout
              titleLeft={tokenName}
              titleRight={availableBalance && <Balance balance={availableBalance} />}
              captionLeft={showChain(chain)}
              captionRight={<Balance balance={fiatBalance} color="ink.text-subdued" />}
            />
          </Flag>
        )
      )}
    </Widget>
  );
}
