import { z } from 'zod';

import { Sip9AssetContent, Sip9Attribute, Sip9Collection, Sip9Owner } from '@leather.io/models';

import { gammaNftMetadataSchema } from './gamma-api.schema';

type GammaNftMetadata = z.infer<typeof gammaNftMetadataSchema>;

export function mapGammaCollection(
  collection?: GammaNftMetadata['item']['collection']
): Sip9Collection | undefined {
  if (!collection) return undefined;

  return {
    id: collection.id,
    type: collection.type,
    name: collection.name,
    isVerified: collection.is_verified,
    locationUrl: collection.location_url,
    totalItems: collection.total_items,
    floorPrice: collection.floor_price_amount
      ? {
          amount: collection.floor_price_amount.amount,
          unit: collection.floor_price_amount.unit,
        }
      : undefined,
  };
}

export function mapGammaOwner(owner?: GammaNftMetadata['item']['owner']): Sip9Owner | undefined {
  if (!owner) return undefined;

  return {
    address: owner.address,
    chain: owner.chain,
    id: owner.id,
    displayName: owner.display_name,
    slug: owner.slug,
    avatarUrl: owner.avatar_url,
    avatarContentType: owner.avatar_content_type,
    profileUrl: owner.profile_url,
    bio: owner.bio,
    isVerified: owner.is_verified,
  };
}

export function mapGammaAttributes(
  attributeGroups?: GammaNftMetadata['attribute_groups']
): Sip9Attribute[] | undefined {
  if (!attributeGroups) return undefined;

  return attributeGroups.flatMap(group =>
    group.attributes.map(attr => ({
      traitType: attr.label,
      displayType: attr.type,
      value: attr.value,
      rarityPercent: attr.rarity_percent_of_100,
    }))
  );
}

export function mapGammaAssetContent(
  assetContent?: GammaNftMetadata['item']['asset_content']
): Sip9AssetContent | undefined {
  if (!assetContent) return undefined;

  return {
    contentUrl: assetContent.content_url,
    contentType: assetContent.content_type,
  };
}
