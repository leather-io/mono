import { TokenBalance } from '@/features/balances/token-balance';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';

import { Box, Pressable } from '@leather.io/ui/native';

import { SendSheetNavigatorParamList } from '../../send-sheet-navigator';
import { SelectAssetRouteProp } from '../../send-sheets/select-asset-sheet';
import { useSendFormContext } from '../send-form-context';

interface SendFormAssetProps {
  assetName: string;
  chain: string;
  icon: React.ReactNode;
}
export function SendFormAsset({ assetName, chain, icon }: SendFormAssetProps) {
  const { availableBalance, fiatBalance, symbol } = useSendFormContext();
  const navigation = useNavigation<NavigationProp<SendSheetNavigatorParamList>>();
  const route = useRoute<SelectAssetRouteProp>();

  return (
    <Pressable
      onPress={() => navigation.navigate('send-select-asset', { account: route.params.account })}
    >
      <Box borderColor="ink.border-default" borderRadius="sm" borderWidth={1} p="4" mb="0">
        <TokenBalance
          availableBalance={availableBalance}
          chain={chain}
          fiatBalance={fiatBalance}
          icon={icon}
          ticker={symbol}
          tokenName={assetName}
        />
      </Box>
    </Pressable>
  );
}
