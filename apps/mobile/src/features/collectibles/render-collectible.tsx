import { TokenDetailsProps } from '@/features/token/types';
import { t } from '@lingui/core/macro';

import {
  InscriptionAsset,
  NonFungibleCryptoAsset,
  Sip9Asset,
  StampAsset,
} from '@leather.io/models';
import { CollectibleImage, ImageUnavailable, Inscription, Sip9, Text } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

function FallbackImage() {
  return (
    <ImageUnavailable>
      <Text textAlign="center">{t`Image currently unavailable`}</Text>
    </ImageUnavailable>
  );
}

interface StampProps {
  item: StampAsset;
  onPress?: () => void;
  height?: number;
}
export function Stamp({ item, onPress, height = 200 }: StampProps) {
  if (!item.stampUrl) return <FallbackImage />;
  return (
    <CollectibleImage
      source={item.stampUrl}
      alt={item.stamp.toString()}
      height={height}
      onPress={onPress}
    />
  );
}

interface Sip9ComponentProps {
  item: Sip9Asset;
  onPress?(): void;
  height?: number;
  viewType: 'thumbnail' | 'full';
}

// on dev2 wallet we miss:
// stillearly.btc
/**
 * Gamma meta
 * {"attribute_groups": [{"attributes": [Array], "title": "Attributes"}], 
 * "item": {"asset_content": {"content_type": "", "content_url": "https://stxnft.mypinata.cloud/ipfs/QmUDBKgiCDW8J8db3bFBhnnVLHwguspGQLZ3zZ6t76ne45"}, "chain": "stacks", 
 * "collection": {"id": "SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2", "is_verified": true, "location_url": "/stacks/collections/bns-v2", "name": "BNS: Bitcoin Name System", 
 * "total_items": 346476, "type": "collection"}, "creator": null, "description": "", "id": "SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2_125721", "is_original": false, 
 * "location_url": "/stacks/nfts/SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2_125721", "market_summary": {"item_id": [Object], "meta": [Object]}, "name": "stillearly.btc", "owner": {"address": "SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H", "avatar_content_type": "image/*", "avatar_url": null, "bio": null, "chain": "stacks", "display_name": "SP3T…ZP2H", "id": "2MqWeRYztY2qoagBxfrtr5cQ4", "is_verified": false, "profile_url": "/SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H", "slug": "SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H"}, "rarity_rank": 0}, "marketplace_events": []}

 */

// Song 8 - werners-song.btc

/*
 we get 
  LOG  Sip9Component image/png StacksMFers #1547
 LOG  Sip9Component image/png Bitcoin Toadz #6408
 LOG  Sip9Component image/png BlockSurvey #90
 LOG  Sip9Component  WORRY - NFT - MUSIC
 LOG  Sip9Component image/png Crash Punk 5559
 LOG  Sip9Component image/jpeg Portals-ALEX-Anniversary-Series
 LOG  Sip9Component video/mp4 6789
 LOG  Sip9Component image/png Invader Block #157360
 LOG  Sip9Component video/mp4 9008
 LOG  Sip9Component image/png Mutant Mojo #17



 LOG  Sip9Component image/png StacksMFers #288
 LOG  Sip9Component  thisisrenastest.btc
 LOG  Sip9Component  notprimary.btc
 LOG  Sip9Component  not-primary.btc



 after removing throw error now we get: 



  LOG  Sip9Component  Stacks NFT #3
 LOG  Sip9Component image/png StacksMFers #1547
 LOG  Sip9Component image/png Bitcoin Toadz #6408
 LOG  Sip9Component image/png BlockSurvey #90
 => newLOG  Sip9Component image/png Stacks Pops #8347
 => newLOG  Sip9Component  Mutant Monkeys #31
 => newLOG  Sip9Component  Stacks NFT #2
 => newLOG  Sip9Component  Stacks NFT #5
 => newLOG  Sip9Component  Stacks NFT #4
 => newLOG  Sip9Component  Stacks NFT #1
 => newLOG  LOG  Sip9Component  Stacks NFT #3
 LOG  Sip9Component  WORRY - NFT - MUSIC
 LOG  Sip9Component image/png Crash Punk 5559
 LOG  Sip9Component image/jpeg Portals-ALEX-Anniversary-Series
 LOG  Sip9Component video/mp4 6789
 LOG  Sip9Component image/png Invader Block #157360
 LOG  Sip9Component video/mp4 9008
 LOG  Sip9Component image/png Mutant Mojo #17
 LOG  Sip9Component image/png StacksMFers #288
 LOG  Sip9Component  thisisrenastest.btc
 LOG  Sip9Component  notprimary.btc
 LOG  Sip9Component  not-primary.btc
 LOG  Sip9Component  stillearly.btc

 
 
 LOG  Sip9Component image/png StacksMFers #1547
*/
export function Sip9Component({ item, onPress, height = 200, viewType }: Sip9ComponentProps) {
  if (!item.cachedImage || item.cachedImage.trim() === '') return <FallbackImage />;
  console.log('Sip9Component', item.contentType, item.name, item.collection, item.cachedImage);
  return (
    <Sip9
      collection={item.collection}
      contentType={item.contentType as 'image/png' | 'image/jpeg' | 'video/mp4' | ''}
      name={item.name}
      height={height}
      src={item.cachedImage}
      onPress={onPress}
      viewType={viewType}
    />
  );
}
interface InscriptionComponentProps {
  item: InscriptionAsset;
  onPress?: () => void;
  height?: number;
}
export function InscriptionComponent({ item, onPress, height = 200 }: InscriptionComponentProps) {
  if (!item.src || item.src.trim() === '') return <FallbackImage />;
  return (
    <Inscription
      name={item.title}
      mimeType={item.mimeType}
      height={height}
      src={item.src}
      onPress={onPress}
    />
  );
}

export function renderCollectible({
  item,
  onPress,
}: {
  item: NonFungibleCryptoAsset;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}) {
  // console.log('renderCollectible', item);
  switch (item.protocol) {
    case 'stamp':
      return (
        <Stamp
          item={item}
          onPress={
            onPress
              ? () =>
                  onPress?.({
                    assetId: item.stamp.toString(),
                    assetProtocol: item.protocol,
                  })
              : undefined
          }
        />
      );
    case 'sip9':
      return (
        <Sip9Component
          item={item}
          onPress={
            onPress
              ? () =>
                  onPress?.({
                    assetId: item.name,
                    assetProtocol: item.protocol,
                  })
              : undefined
          }
          viewType="thumbnail"
        />
      );
    case 'inscription':
      return (
        <InscriptionComponent
          item={item}
          onPress={
            onPress
              ? () =>
                  onPress?.({
                    assetId: item.id,
                    assetProtocol: item.protocol,
                  })
              : undefined
          }
        />
      );
    default:
      return assertUnreachable(item);
  }
}
