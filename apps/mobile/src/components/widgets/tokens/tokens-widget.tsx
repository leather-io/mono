import {
  BitcoinBalance,
  BitcoinBalanceByAccount,
} from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalance, StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { AccountId } from '@/models/domain.model';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';

import { Widget } from '../components/widget';

export function TokensWidget({ children }: HasChildren) {
  return (
    <Widget>
      <Widget.Header>
        <Widget.Title title={t({ id: 'tokens.header_title', message: 'My tokens' })} />
      </Widget.Header>
      <Widget.Body>{children}</Widget.Body>
    </Widget>
  );
}

export function AllAccountBalances() {
  return (
    <>
      <BitcoinBalance />
      <StacksBalance />
    </>
  );
}

export function AccountBalances({ fingerprint, accountIndex }: AccountId) {
  console.log('AccountBalances tokens-widget');
  return (
    <>
      <BitcoinBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
      <StacksBalanceByAccount fingerprint={fingerprint} accountIndex={accountIndex} />
    </>
  );
}
/**
 * 
 * Opened first account  
 LOG  AccountBalances tokens-widget
 LOG  BitcoinBalanceByAccount efd01538 0 {"amount": "117881", "decimals": 8, "symbol": "BTC"} {"amount": "116.3791942360853551806", "decimals": 2, "symbol": "USD"}
 LOG  StacksBalanceByAccount efd01538 0 {"amount": "664345719", "decimals": 6, "symbol": "STX"} {"amount": "128393.89015067216195607225", "decimals": 2, "symbol": "USD"}
 
 * Opened second account
 LOG  AccountBalances tokens-widget
 LOG  BitcoinBalanceByAccount d274a3bb 0 {"amount": "78481", "decimals": 8, "symbol": "BTC"} {"amount": "77.4811508457021467406", "decimals": 2, "symbol": "USD"}
 LOG  StacksBalanceByAccount d274a3bb 0 {"amount": "0", "decimals": 6, "symbol": "STX"} {"amount": "0", "decimals": 2, "symbol": "USD"}
 LOG  BitcoinBalanceByAccount d274a3bb 0 {"amount": "0", "decimals": 8, "symbol": "BTC"} {"amount": "0", "decimals": 2, "symbol": "USD"}
 LOG  AccountBalances tokens-widget
 LOG  BitcoinBalanceByAccount d274a3bb 0 {"amount": "0", "decimals": 8, "symbol": "BTC"} {"amount": "0", "decimals": 2, "symbol": "USD"}
 LOG  StacksBalanceByAccount d274a3bb 0 {"amount": "0", "decimals": 6, "symbol": "STX"} {"amount": "0", "decimals": 2, "symbol": "USD"}
 * - why is this running 3 times?
 * - rendering AccountBalances twice?
 * - btc balance is incorrect at first as should be 0
 */

/**
 *
 *  LOG  AccountScreen rendered {"account": "[account]", "accountId": "efd01538/0"} {"amount": "129807.2602767433328", "decimals": 2, "symbol": "USD"}
 LOG  AccountLayout rendered
 LOG  AccountBalances tokens-widget
 LOG  BitcoinBalanceByAccount efd01538 0 {"amount": "117881", "decimals": 8, "symbol": "BTC"} {"amount": "116.6186100216228053488", "decimals": 2, "symbol": "USD"}
 LOG  StacksBalanceByAccount efd01538 0 {"amount": "664345719", "decimals": 6, "symbol": "STX"} {"amount": "129690.64166672171790739148448573", "decimals": 2, "symbol": "USD"}
 LOG  AccountScreen rendered {"account": "[account]", "accountId": "d274a3bb/0"} {"amount": "77.64054540686777", "decimals": 2, "symbol": "USD"}
 LOG  AccountLayout rendered
 LOG  AccountBalances tokens-widget
 // BitcoinBalanceByAccount seems to first have the incorrect value from the previous account  AccountScreen rendered totalBalance
 LOG  BitcoinBalanceByAccount d274a3bb 0 {"amount": "78481", "decimals": 8, "symbol": "BTC"} {"amount": "77.6405454068677682288", "decimals": 2, "symbol": "USD"}
 LOG  StacksBalanceByAccount d274a3bb 0 {"amount": "0", "decimals": 6, "symbol": "STX"} {"amount": "0", "decimals": 2, "symbol": "USD"}
 LOG  BitcoinBalanceByAccount d274a3bb 0 {"amount": "0", "decimals": 8, "symbol": "BTC"} {"amount": "0", "decimals": 2, "symbol": "USD"}
 LOG  AccountScreen rendered {"account": "[account]", "accountId": "d274a3bb/0"} {"amount": "0", "decimals": 2, "symbol": "USD"}
 LOG  AccountLayout rendered
 LOG  AccountBalances tokens-widget
 LOG  BitcoinBalanceByAccount d274a3bb 0 {"amount": "0", "decimals": 8, "symbol": "BTC"} {"amount": "0", "decimals": 2, "symbol": "USD"}
 LOG  StacksBalanceByAccount d274a3bb 0 {"amount": "0", "decimals": 6, "symbol": "STX"} {"amount": "0", "decimals": 2, "symbol": "USD"} 
 * 
 */
