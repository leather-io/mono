import { z } from 'zod';

export const gammaNftMetadataSchema = z.object({
  item: z.object({
    id: z.string(),
    chain: z.string(),
    name: z.string(),
    description: z.string(),
    asset_content: z
      .object({
        content_url: z.string(),
        content_type: z.string(),
      })
      .optional(),
    location_url: z.string(),
    collection: z
      .object({
        id: z.string(),
        type: z.string(),
        name: z.string(),
        is_verified: z.boolean(),
        location_url: z.string(),
        total_items: z.number().optional(),
        floor_price_amount: z
          .object({
            amount: z.number(),
            unit: z.string(),
          })
          .optional(),
      })
      .optional(),
    owner: z.object({
      address: z.string(),
      chain: z.string(),
      id: z.string(),
      display_name: z.string(),
      slug: z.string(),
      avatar_url: z.string().nullable(),
      avatar_content_type: z.string().nullable(),
      profile_url: z.string(),
      bio: z.string().nullable(),
      is_verified: z.boolean(),
    }),
    market_summary: z
      .object({
        item_id: z.object({
          id: z.string(),
          chain: z.string(),
        }),
        listing: z
          .object({
            item_id: z.string(),
            price_amount: z.object({
              amount: z.number(),
              unit: z.string(),
            }),
            seller: z.object({
              address: z.string(),
              chain: z.string(),
            }),
            timestamp: z.number(),
            has_in_progress_purchase: z.boolean(),
            is_auction: z.boolean(),
          })
          .nullable()
          .optional(),
        highest_offer: z
          .object({
            id: z.string(),
            offer_type: z.string(),
            price_amount: z.object({
              amount: z.number(),
              unit: z.string(),
            }),
            offer_by_address: z.object({
              address: z.string(),
              chain: z.string(),
            }),
            blocks_remaining: z.number(),
          })
          .nullable()
          .optional(),
        latest_sale: z
          .object({
            price_amount: z.object({
              amount: z.number(),
              unit: z.string(),
            }),
          })
          .nullable()
          .optional(),
        meta: z.object({
          can_list: z.boolean(),
          can_unlist: z.boolean(),
          can_purchase: z.boolean(),
          can_make_offer: z.boolean(),
          can_withdraw_offer: z.boolean(),
          can_accept_offer: z.boolean(),
          can_change_offer: z.boolean(),
          can_place_auction_bid: z.boolean(),
          can_change_price: z.boolean(),
          can_transfer: z.boolean(),
        }),
      })
      .optional(),
    rarity_rank: z.number().optional(),
    creator: z.any().nullable(),
    is_original: z.boolean(),
  }),
  attribute_groups: z
    .array(
      z.object({
        title: z.string(),
        attributes: z.array(
          z.object({
            type: z.string(),
            label: z.string(),
            value: z.string(),
            rarity_percent_of_100: z.number().optional(),
          })
        ),
      })
    )
    .optional(),
  marketplace_events: z
    .array(
      z.object({
        type: z.string(),
        seller: z.object({
          address: z.string(),
          chain: z.string(),
          id: z.string(),
          display_name: z.string(),
          slug: z.string(),
          avatar_url: z.string().nullable(),
          avatar_content_type: z.string().nullable(),
          profile_url: z.string(),
          bio: z.string().nullable(),
          is_verified: z.boolean(),
        }),
        buyer: z
          .object({
            address: z.string(),
            chain: z.string(),
            id: z.string(),
            display_name: z.string(),
            slug: z.string(),
            avatar_url: z.string().nullable(),
            avatar_content_type: z.string().nullable(),
            profile_url: z.string(),
            bio: z.string().nullable(),
            is_verified: z.boolean(),
          })
          .nullable(),
        token_amount: z
          .object({
            amount: z.number(),
            unit: z.string(),
          })
          .nullable(),
        external_url: z.string(),
        timestamp: z.number(),
        item: z.object({
          id: z.string(),
          chain: z.string(),
          name: z.string(),
          description: z.string(),
          asset_content: z.object({
            content_url: z.string(),
            content_type: z.string(),
          }),
          location_url: z.string(),
          owner: z.object({
            address: z.string(),
            chain: z.string(),
            id: z.string(),
            display_name: z.string(),
            slug: z.string(),
            avatar_url: z.string().nullable(),
            avatar_content_type: z.string().nullable(),
            profile_url: z.string(),
            bio: z.string().nullable(),
            is_verified: z.boolean(),
          }),
          market_summary: z.object({
            item_id: z.object({
              id: z.string(),
              chain: z.string(),
            }),
            meta: z.object({
              can_list: z.boolean(),
              can_unlist: z.boolean(),
              can_purchase: z.boolean(),
              can_make_offer: z.boolean(),
              can_withdraw_offer: z.boolean(),
              can_accept_offer: z.boolean(),
              can_change_offer: z.boolean(),
              can_place_auction_bid: z.boolean(),
              can_change_price: z.boolean(),
              can_transfer: z.boolean(),
            }),
          }),
          rarity_rank: z.number().optional(),
          creator: z.any().nullable(),
          is_original: z.boolean(),
        }),
      })
    )
    .optional(),
});

export const gammaCollectionMetadataSchema = z.object({
  collection: z.object({
    id: z.string(),
    chain: z.string(),
    type: z.string(),
    state: z.string(),
    name: z.string(),
    description: z.string(),
    is_verified: z.boolean(),
    location_url: z.string(),
    original_artwork_item_location_url: z.string().nullable(),
    content_url: z.string(),
    content_type: z.string(),
    creator_user_ref: z.any().nullable(),
    twitter_url: z.string().optional(),
    website_url: z.string().optional(),
    discord_url: z.string().optional(),
    stats: z
      .object({
        floor_price: z.object({
          amount: z.number(),
          unit: z.string(),
        }),
        total_volume: z.object({
          amount: z.number(),
          unit: z.string(),
        }),
        listed_count: z.number(),
        total_items: z.number().optional(),
        total_mintable_supply: z.number(),
        secondary_sales_count: z.number(),
        primary_sales_count: z.number(),
        offers_count: z.number(),
        best_collection_offer: z
          .object({
            id: z.string(),
            offer_type: z.string(),
            price_amount: z.object({
              amount: z.number(),
              unit: z.string(),
            }),
            offer_by_address: z.object({
              address: z.string(),
              chain: z.string(),
            }),
            blocks_remaining: z.number(),
          })
          .optional(),
        lowest_purchasable_price: z.object({
          amount: z.number(),
          unit: z.string(),
        }),
      })
      .optional(),
    market_meta: z.object({
      can_make_offer: z.boolean(),
    }),
    filter_config: z.object({
      has_numbers: z.boolean(),
      has_collection_rarity: z.boolean(),
      has_collection_indexes: z.boolean(),
    }),
    display_config: z.object({
      color_gradient: z.string(),
    }),
    attributes: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
          rarity_percent_of_100: z.number().optional(),
          count: z.number().optional(),
        })
      )
      .optional(),
    mint_information: z.any().nullable(),
    signals_information: z.any().nullable(),
    created_at: z.string(),
  }),
});
