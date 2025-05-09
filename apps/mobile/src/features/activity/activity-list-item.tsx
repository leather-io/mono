import { Balance } from '@/components/balance/balance';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';

import { Activity } from '@leather.io/models';
import { Flag, ItemLayout, Pressable } from '@leather.io/ui/native';

import { ActivityIcon } from './activity-icon';
import { formatActivityCaption, getActivityTitle } from './utils/format-activity';
import { goToExplorer } from './utils/go-to-explorer';

interface ActivityListItemProps {
  activity: Activity;
}

function getBalanceOperator(activity: Activity) {
  if (activity.type === 'receiveAsset') return '+';
  if (activity.type === 'sendAsset') return '-';
  return undefined;
}

// Pete - check design and fix this and other issues mentioned in LEA-2473
// > next up - new icons and check widget styles
// then implement FlashList + remove header
// add new empty state
// then check for other easy win UI issues related to activity list
> Pete - actually steaming ahead here. try and finish most of this stuff tomorrow
> then can try do Token View / Token List

-> probably better finishing work here and then picking commits cleanly to a new branch / multiple? 
-> hit a nasty rebase issue



function getBalanceColor(activity: Activity) {
  const isSendOrReceive = activity.type === 'sendAsset' || activity.type === 'receiveAsset';
  if (isSendOrReceive && activity.status === 'success') return 'green.action-primary-default';

  return undefined;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  const { mode } = useCurrentNetworkState();

  const txid = 'txid' in activity ? activity.txid : undefined;
  const value = 'value' in activity ? activity.value : undefined;
  const asset = 'asset' in activity ? activity.asset : undefined;
  const status = 'status' in activity ? activity.status : undefined;
  const activityAsset = asset && 'symbol' in asset ? asset : undefined;
  const activityChain = activityAsset && 'chain' in activityAsset ? activityAsset.chain : undefined;

  //   account: { accountIndex: 0, fingerprint: 'efd01538' },
  //   fromAmount: '200000',
  //   fromAsset: {
  //     category: 'fungible',
  //     chain: 'stacks',
  //     decimals: 6,
  //     hasMemo: false,
  //     protocol: 'nativeStx',
  //     symbol: 'STX',
  //   },
  //   fromValue: {
  //     // crypto: { amount: [BigNumber], decimals: 6, symbol: 'STX' },
  //     // fiat: { amount: [BigNumber], decimals: 2, symbol: 'USD' },
  //   },
  //   level: 'account',
  //   status: 'success',
  //   timestamp: 1745962072,
  //   toAmount: '182',
  //   toAsset: {
  //     assetId: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aewbtc::aeWBTC',
  //     canTransfer: true,
  //     category: 'fungible',
  //     chain: 'stacks',
  //     contractId: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aewbtc',
  //     decimals: 8,
  //     hasMemo: true,
  //     imageCanonicalUri:
  //       'https://allbridge-assets.web.app/320px/ETH/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599.svg',
  //     name: 'Ethereum WBTC via Allbridge',
  //     protocol: 'sip10',
  //     symbol: 'aeWBTC',
  //   },
  //   // toValue: {
  //   //   crypto: { amount: [BigNumber], decimals: 8, symbol: 'aeWBTC' },
  //   //   fiat: { amount: [BigNumber], decimals: 2, symbol: 'USD' },
  //   // },
  //   txid: '0x907bb486f4a0ce0784a6aec8efbc7086c6cbc894ab2d8cffbff0426f9fd8a9bd',
  //   type: 'swapAssets',
  // };
  // const mockExecuteSmartContractActivity = {
  //   type: 'executeSmartContract',
  //   contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx',
  //   functionName: 'transfer',
  //   timestamp: 1746632104,
  //   level: 'account',
  //   account: {
  //     fingerprint: 'efd01538',
  //     accountIndex: 0,
  //   },
  //   txid: '0xf4c3259d9353e417c4fb65869b4a4e2ccae5350401bc7e1a171ce2175d0a71bf',
  //   status: 'failed',
  // };
  // const mockSendAssetActivity = {
  //   type: 'sendAsset',
  //   receivers: ['SP2MF04VAGYHGAZWGTEDW5VYCPDWWSY08Z1QFNDSN'],
  //   timestamp: 1746627887,
  //   level: 'account',
  //   account: {
  //     fingerprint: 'efd01538',
  //     accountIndex: 0,
  //   },
  //   txid: '0x4e897a69e3849f519fa42b333067f012a1885600feb480e91dfd212ecee6ee9e',
  //   status: 'success',
  //   asset: {
  //     chain: 'stacks',
  //     protocol: 'nativeStx',
  //     symbol: 'STX',
  //     category: 'fungible',
  //     decimals: 6,
  //     hasMemo: false,
  //   },
  //   amount: '1000',
  //   value: {
  //     crypto: {
  //       amount: '1000',
  //       symbol: 'STX',
  //       decimals: 6,
  //     },
  //     fiat: {
  //       amount: '0.0924206',
  //       symbol: 'USD',
  //       decimals: 2,
  //     },
  //   },
  // };

  //   amount: '131100',
  //   asset: {
  //     assetId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token::ststxbtc',
  //     canTransfer: true,
  //     category: 'fungible',
  //     chain: 'stacks',
  //     contractId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststxbtc-token',
  //     decimals: 6,
  //     hasMemo: true,
  //     imageCanonicalUri: 'https://app.stackingdao.com/ststxbtc-logo.png',
  //     name: 'Stacked STX BTC Token',
  //     protocol: 'sip10',
  //     symbol: 'stSTXbtc',
  //   },
  //   level: 'account',
  //   receivers: ['SP26AZ1JSFZQ82VH5W2NJSB2QW15EW5YKT6WMD69J'],
  //   status: 'success',
  //   timestamp: 1744967592,
  //   txid: '0xf69e70612cfde13b54b1c648b8883b066b7d6158fa9d1cdfe14aa4b0d8642652',
  //   type: 'sendAsset',
  //   value: {
  //     crypto: { amount: [BigNumber], decimals: 6, symbol: 'stSTXbtc' },
  //     fiat: { amount: [BigNumber], decimals: 2, symbol: 'USD' },
  //   },
  // };
  return (
    <Pressable
      flexDirection="row"
      disabled={!txid}
      onPress={
        txid && activityChain ? () => goToExplorer({ activityChain, txid, mode }) : undefined
      }
    >
      <Flag
        img={<ActivityIcon type={activity.type} asset={activityAsset} status={status} />}
        px="5"
        py="3"
      >
        <ItemLayout
          titleLeft={getActivityTitle(activity)}
          titleRight={
            value?.fiat ? (
              <Balance
                operator={getBalanceOperator(activity)}
                balance={value.fiat}
                color={getBalanceColor(activity)}
              />
            ) : undefined
          }
          captionLeft={
            // FIXME LEA-2473 - should pre-filter all activities
            // to only include these types - onChain using OnChainActivity type / BaseOnChainActivity
            activity.type === 'sendAsset' ||
            activity.type === 'receiveAsset' ||
            activity.type === 'swapAssets' ||
            activity.type === 'executeSmartContract' ||
            activity.type === 'deploySmartContract'
              ? formatActivityCaption({
                  activityType: activity.type,
                  status: activity.status,
                  timestamp: activity.timestamp,
                })
              : undefined
          }
          captionRight={
            value?.crypto ? <Balance balance={value.crypto} color="ink.text-subdued" /> : undefined
          }
        />
      </Flag>
    </Pressable>
  );
}
