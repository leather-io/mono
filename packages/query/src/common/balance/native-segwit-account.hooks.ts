// import { useMemo } from 'react';
// import { useSelector } from 'react-redux';

// import { createSelector } from '@reduxjs/toolkit';

// import {
//   deriveNativeSegwitAccountFromRootKeychain,
//   getNativeSegWitPaymentFromAddressIndex,
//   lookUpLedgerKeysByPath,
//   makeNativeSegwitAccountDerivationPath,
// } from '@leather.io/bitcoin';

// import { selectCurrentNetwork } from '@app/store/networks/networks.selectors';

// import { useCurrentAccountIndex } from '../../account';
// import {
//   bitcoinAccountBuilderFactory,
//   useBitcoinExtendedPublicKeyVersions,
// } from './bitcoin-keychain';
// import { bitcoinAddressIndexSignerFactory } from './bitcoin-signer';

// const selectNativeSegwitAccountBuilder = bitcoinAccountBuilderFactory(
//   deriveNativeSegwitAccountFromRootKeychain,
//   lookUpLedgerKeysByPath(makeNativeSegwitAccountDerivationPath)
// );

// const selectCurrentNetworkNativeSegwitAccountBuilder = createSelector(
//   selectNativeSegwitAccountBuilder,
//   selectCurrentNetwork,
//   (nativeSegwitKeychains, network) => nativeSegwitKeychains[network.chain.bitcoin.bitcoinNetwork]
// );

// function useNativeSegwitAccountBuilder() {
//   return useSelector(selectCurrentNetworkNativeSegwitAccountBuilder);
// }

// export function useNativeSegwitSigner(accountIndex: number) {
//   const account = useNativeSegwitAccountBuilder()(accountIndex);
//   const extendedPublicKeyVersions = useBitcoinExtendedPublicKeyVersions();

//   return useMemo(() => {
//     if (!account) return;
//     return bitcoinAddressIndexSignerFactory({
//       accountIndex,
//       accountKeychain: account.keychain,
//       paymentFn: getNativeSegWitPaymentFromAddressIndex,
//       network: account.network,
//       extendedPublicKeyVersions,
//     });
//   }, [account, accountIndex, extendedPublicKeyVersions]);
// }

// export function useCurrentAccountNativeSegwitSigner() {
//   const currentAccountIndex = useCurrentAccountIndex();
//   return useNativeSegwitSigner(currentAccountIndex);
// }

// // TODO: as ledger users are able to have only stacks account on their devices, this hook throws an unnecessary error.
// // To alleviate that, use useCurrentAccountNativeSegwitIndexZeroSignerNullable
// export function useCurrentAccountNativeSegwitIndexZeroSigner() {
//   const signer = useCurrentAccountNativeSegwitSigner();
//   return useMemo(() => {
//     if (!signer) throw new Error('No signer');
//     return signer(0);
//   }, [signer]);
// }

// export function useCurrentAccountNativeSegwitIndexZeroSignerNullable() {
//   const signer = useCurrentAccountNativeSegwitSigner();
//   return useMemo(() => {
//     if (!signer) return undefined;
//     return signer(0);
//   }, [signer]);
// }
