import { Balance } from '@/components/balance/balance';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useCopyAddress } from '@/hooks/use-copy-address';

// import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
// import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
// import { Account } from '@/store/accounts/accounts';
// import { useAccountByIndex } from '@/store/accounts/accounts.read';
// import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
// import { t } from '@lingui/core/macro';
import { Money, Sip10Asset } from '@leather.io/models';
import { Box, Cell, Text } from '@leather.io/ui/native';
import { truncateMiddle } from '@leather.io/utils';

// import { AccountAvatar } from '../account/components/account-avatar';
// import { getAssets } from '../receive/get-assets';
// import { BitcoinAccountAddressList } from './bitcoin/bitcoin-token-details';
// import { TokenDetailsCard } from './components/token-details-card';
// import { Sip10AccountAddressList } from './stacks/sip10-token-details';
// import { StacksAccountAddressList } from './stacks/stacks-token-details';

// export function AccountAddressList({
//   tokenId,
//   accountIndex,
//   fingerprint,
// }: {
//   tokenId: string;
//   accountIndex: number;
//   fingerprint: string;
// }) {
//   const account = useAccountByIndex(fingerprint, accountIndex);
//   if (!account) {
//     return null;
//   }

//   return (
//     <TokenDetailsCard
//       title={
//         <Box flexDirection="row" alignItems="center" gap="2">
//           <AccountAvatar icon={account.icon} size={16} />
//           <Text variant="label03">{account.name}</Text>
//         </Box>
//       }
//     >
//       {/* <AddressList account={account} tokenId={tokenId} /> */}
//       {tokenId === 'BTC' && <BitcoinAccountAddressList account={account} />}
//       {tokenId === 'STX' && <StacksAccountAddressList account={account} />}
//       {tokenId === 'SIP10' && <Sip10AccountAddressList account={account} tokenId={tokenId} />}
//     </TokenDetailsCard>
//   );
// }

// function AddressList({ account, tokenId }: { account: Account; tokenId: string }) {
//   // const { nativeSegwitPayerAddress, taprootPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
//   //   account.fingerprint,
//   //   account.accountIndex
//   // );
//   const stxAddress = useStacksSignerAddressFromAccountIndex(
//     account.fingerprint,
//     account.accountIndex
//   );

//   // const assets = getAssets({
//   //   nativeSegwitPayerAddress,
//   //   taprootPayerAddress,
//   //   stxAddress: stxAddress ?? '',
//   // });

//   // const btcTaprootBalance = useBtcAccountTaprootBalance(account.fingerprint, account.accountIndex);
//   // const btcNativeSegwitBalance = useBtcAccountNativeSegwitBalance(
//   //   account.fingerprint,
//   //   account.accountIndex
//   // );

//   // PETE maybe I should just do this in the index routes for tokens too? Or just split into separate screens?
//   const stxBalance = useStxAccountBalance(account.fingerprint, account.accountIndex);

//   const sip10Balances = useSip10AccountBalance(account.fingerprint, account.accountIndex);

//   const sip10Balance = sip10Balances.value?.sip10s.find(sip10 => sip10.asset.symbol === tokenId);
//   // could compose this in if I follow the same pattern as balances at the top level
//   // if (tokenId === 'BTC') {
//   //   return (
//   //     <Box>
//   //       <AddressListItem
//   //         accountName={account.name}
//   //         address={nativeSegwitPayerAddress}
//   //         name={t`Native Segwit`}
//   //         tokenId={tokenId}
//   //         availableBalance={btcNativeSegwitBalance.value?.btc.availableBalance}
//   //         quoteBalance={btcNativeSegwitBalance.value?.quote.availableBalance}
//   //         // asset={assets[0]}
//   //       />
//   //       <AddressListItem
//   //         accountName={account.name}
//   //         address={taprootPayerAddress}
//   //         name={t`Taproot`}
//   //         tokenId={tokenId}
//   //         availableBalance={btcTaprootBalance.value?.btc.availableBalance}
//   //         quoteBalance={btcTaprootBalance.value?.quote.availableBalance}
//   //         // asset={assets[1]}
//   //       />
//   //     </Box>
//   //   );
//   // }
//   if (tokenId === 'STX') {
//     return (
//       <Box>
//         <AddressListItem
//           accountName={account.name}
//           address={stxAddress ?? ''}
//           name={t`STX`}
//           tokenId={tokenId}
//           availableBalance={stxBalance.value?.stx.availableBalance}
//           quoteBalance={stxBalance.value?.quote.availableBalance}
//           // asset={assets[2]}
//         />
//       </Box>
//     );
//   }
//   return (
//     <Box>
//       <AddressListItem
//         accountName={account.name}
//         address={stxAddress ?? ''}
//         name={sip10Balance?.asset.name ?? ''}
//         tokenId={tokenId}
//         availableBalance={sip10Balance?.crypto.availableBalance}
//         quoteBalance={sip10Balance?.quote.availableBalance}
//       />
//     </Box>
//   );
// }

interface AddressListItemProps {
  accountName: string;
  address: string;
  name: string;
  availableBalance?: Money;
  quoteBalance?: Money;
  tokenId: string;
}

export function AddressListItem({
  address,
  name,
  availableBalance,
  quoteBalance,
}: AddressListItemProps) {
  const { receiveSheetRef } = useGlobalSheets();

  const onCopyAddress = useCopyAddress();

  return (
    <Cell.Root pressable={true} onPress={() => receiveSheetRef.current?.present()}>
      <Cell.Content>
        <Cell.Label variant="primary">
          <Text variant="label02">{name}</Text>
        </Cell.Label>
        <Cell.Label variant="secondary" onPress={() => void onCopyAddress(address)}>
          {truncateMiddle(address)}
        </Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">
          <Balance balance={availableBalance} variant="label02" />
        </Cell.Label>
        <Cell.Label variant="secondary">
          <Balance balance={quoteBalance} variant="caption01" color="ink.text-subdued" />
        </Cell.Label>
      </Cell.Aside>
    </Cell.Root>
  );
}
