import AlexIcon from '@/assets/dapps/alex-logo.svg';
import ArkadikoIcon from '@/assets/dapps/arkadiko-logo.svg';
import BitflowIcon from '@/assets/dapps/bitflow-logo.svg';
import GraniteIcon from '@/assets/dapps/granite-logo.svg';
import HermeticaIcon from '@/assets/dapps/hermetica-logo.svg';
import VelarIcon from '@/assets/dapps/velar-logo.svg';
import ZestIcon from '@/assets/dapps/zest-logo.svg';
import { t } from '@lingui/macro';

import {
  ALEX_LINK,
  ARKADIKO_LINK,
  BITFLOW_LINK,
  GRANITE_LINK,
  HERMETICA_LINK,
  VELAR_LINK,
  ZEST_LINK,
} from '@leather.io/constants';
import { Box, Text } from '@leather.io/ui/native';

import { DappCard } from '../dapp-card';
import { BrowserTabSheetLayout } from './browser-tab-sheet.layout';

interface SuggestedProps {
  goToUrl(url: string): void;
}
export function BrowserSuggestedTab({ goToUrl }: SuggestedProps) {
  return (
    <BrowserTabSheetLayout>
      <Text variant="heading05" pt="3" pb="5">
        {t({
          id: 'browser-sheet.suggested-dapps.title',
          message: 'Explore',
        })}
      </Text>
      <Box gap="3">
        <DappCard
          icon={<ArkadikoIcon />}
          onPress={() => goToUrl(ARKADIKO_LINK)}
          title={t({
            id: 'browser-sheet.dapp.arkadiko.title',
            message: 'Arkadiko',
          })}
          caption={t({
            id: 'browser-sheet.dapp.arkadiko.caption',
            message:
              'A Bitcoin-secured protocol for vault-based borrowing, USDA minting, and decentralized smart contract automation.',
          })}
          imageSrc={require('@/assets/dapps/arkadiko.png')}
        />

        <DappCard
          icon={<GraniteIcon />}
          onPress={() => goToUrl(GRANITE_LINK)}
          title={t({
            id: 'browser-sheet.dapp.granite.title',
            message: 'Granite',
          })}
          caption={t({
            id: 'browser-sheet.dapp.granite.caption',
            message:
              'Use sBTC to borrow stablecoins non-custodially, without risk of forced liquidations',
          })}
          imageSrc={require('@/assets/dapps/granite.png')}
        />

        <DappCard
          icon={<HermeticaIcon />}
          onPress={() => goToUrl(HERMETICA_LINK)}
          title={t({
            id: 'browser-sheet.dapp.hermetica.title',
            message: 'Hermetica',
          })}
          caption={t({
            id: 'browser-sheet.dapp.hermetica.caption',
            message:
              'A Bitcoin-backed synthetic dollar that generates up to 25% APY through delta-neutral strategies',
          })}
          imageSrc={require('@/assets/dapps/hermetica.png')}
        />

        <DappCard
          icon={<ZestIcon />}
          onPress={() => goToUrl(ZEST_LINK)}
          title={t({
            id: 'browser-sheet.dapp.zest.title',
            message: 'Zest',
          })}
          caption={t({
            id: 'browser-sheet.dapp.zest.caption',
            message:
              'A Bitcoin-native protocol on Stacks for borrowing, lending, and yield generation through overcollateralized loans and BTC staking pools',
          })}
          imageSrc={require('@/assets/dapps/zest.png')}
        />

        <DappCard
          icon={<BitflowIcon />}
          onPress={() => goToUrl(BITFLOW_LINK)}
          title={t({
            id: 'browser-sheet.dapp.bitflow.title',
            message: 'Bitflow',
          })}
          caption={t({
            id: 'browser-sheet.dapp.bitflow.caption',
            message:
              'A Bitcoin-native DEX aggregator and liquidity hub that sources the best prices across Stacks-based protocols.',
          })}
          imageSrc={require('@/assets/dapps/bitflow.png')}
        />

        <DappCard
          icon={<AlexIcon />}
          onPress={() => goToUrl(ALEX_LINK)}
          title={t({
            id: 'browser-sheet.dapp.alex.title',
            message: 'Alex',
          })}
          caption={t({
            id: 'browser-sheet.dapp.alex.caption',
            message:
              'A DeFi platform on Stacks offering swaps, staking, fixed-term lending, and cross-chain liquidity with Bitcoin security',
          })}
          imageSrc={require('@/assets/dapps/alex.png')}
        />

        <DappCard
          icon={<VelarIcon />}
          onPress={() => goToUrl(VELAR_LINK)}
          title={t({
            id: 'browser-sheet.dapp.velar.title',
            message: 'Velar',
          })}
          caption={t({
            id: 'browser-sheet.dapp.velar.caption',
            message:
              'A DeFi suite offering trading, liquidity, and launchpad access built on Bitcoin L2s like Stacks',
          })}
          imageSrc={require('@/assets/dapps/velar.png')}
        />
      </Box>
    </BrowserTabSheetLayout>
  );
}
