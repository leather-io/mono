import { z } from 'zod';

// Common schemas
const slugSchema = z.object({
  current: z.string(),
  _type: z.literal('slug').optional(),
});

const imageAssetSchema = z.object({
  asset: z.object({
    _ref: z.string(),
    _type: z.literal('reference'),
  }),
  _type: z.literal('image').optional(),
});

const legacyPostWithSlugSchema = z.object({
  _id: z.string(),
  slug: slugSchema,
});

// Post schema
export const postSchema = z.object({
  _id: z.string(),
  _type: z.literal('post'),
  title: z.string(),
  slug: slugSchema,
  publishedAt: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date string',
  }),
  status: z.literal('published').optional(),
  category: z
    .enum([
      'Apps',
      'Bitcoin',
      'DeFi',
      'Developer Docs',
      'Ecosystem',
      'Explainers',
      'Guides',
      'Leather Lounge',
      'Legal',
      'News',
      'Spotlights',
      'Stacks',
      'Tokens',
      'Wallet',
    ])
    .optional(),
  subcategory: z
    .enum([
      'APIs',
      'Basics',
      'Bitcoin NFTs',
      'Connect to apps',
      'DeFi',
      'Exchanges / Marketplaces',
      'Gaming',
      'General',
      'Get started',
      'Integration',
      'Interviews',
      'Legal',
      'None',
      'Ordinals',
      'Security',
      'Settings',
      'Smart Contracts',
      'Stablecoins',
      'Stacking',
      'Staking',
      'Transactions',
      'Wallets',
      'sBTC',
    ])
    .optional(),
  body: z.string().optional(),
  summary: z.string().optional(),
  sentence: z.string().optional(),
  question: z.string().optional(),
  prompt: z.string().optional(),
  featured: z.boolean().optional(),
  hidden: z.boolean().optional(),
  images: z
    .array(
      z.object({
        asset: z
          .object({
            _ref: z.string(),
            _type: z.literal('reference'),
          })
          .optional(),
        name: z.string().optional(),
        _type: z.literal('image').optional(),
      })
    )
    .optional(),
  icons: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.string().url().optional(),
      })
    )
    .optional(),
  website: z.url().optional(),
  disclaimer: z.string().optional(),
  order: z.number().optional(),
  platform: z.enum(['All', 'Extension', 'Mobile', 'Web', 'Desktop', 'None']).optional(),
  aliases: z.string().optional(),
  dataPointInstructions: z.string().optional(),
  dataPointSource: z.string().optional(),
  dataPointValue: z.string().optional(),
  views: z.array(z.string()).optional(),
  earnProviders: z.array(z.string()).optional(),
  createdTime: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date string',
    })
    .optional(),
  log: z.string().optional(),
});

// SBTC Pool schema
export const sbtcPoolSchema = z.object({
  _id: z.string(),
  _type: z.literal('sbtcPool'),
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tvl: z.string().regex(/BTC$/, 'TVL should end with "BTC"'),
  tvlUsd: z.string().regex(/^\$/, 'TVL USD should start with "$"'),
  minCommitment: z.string().regex(/BTC$/, 'Min commitment should end with "BTC"'),
  minCommitmentUsd: z.string().regex(/^\$/, 'Min commitment USD should start with "$"'),
  apr: z.string().regex(/%$/, 'APR should end with "%"'),
  payoutToken: z.string(),
  url: z.url(),
  logo: imageAssetSchema,
});

// FAQ schema
export const faqSchema = z.object({
  _id: z.string(),
  _type: z.literal('faq'),
  question: z.string(),
  answer: z.string(),
  tags: z.array(z.string()),
  legacyPost: legacyPostWithSlugSchema.optional(),
});

// FAQ Section schema
export const faqSectionSchema = z.object({
  _id: z.string().optional(),
  _type: z.literal('faqSection').optional(),
  title: z.string().nullable().optional(),
  category: z.string(),
  faqBuilder: z.array(faqSchema),
});

// Basic Concept schema
export const basicConceptSchema = z.object({
  _id: z.string(),
  _type: z.literal('basicConcept'),
  name: z.string(),
  description: z.string(),
  commonAcronym: z.string().optional(),
  slug: slugSchema,
  relatedLegacyPost: z
    .object({
      slug: slugSchema,
    })
    .optional(),
});

export const sbtcConceptsSchema = z.object({
  historicalYield: basicConceptSchema.pick({
    name: true,
    description: true,
    relatedLegacyPost: true,
  }),
  minimumCommitment: basicConceptSchema.pick({
    name: true,
    description: true,
    relatedLegacyPost: true,
  }),
  rewardsToken: basicConceptSchema.pick({ name: true, description: true, relatedLegacyPost: true }),
  tvl: basicConceptSchema.pick({ name: true, description: true, relatedLegacyPost: true }),
});

// Array schemas for query responses
export const allPostsSchema = z.array(postSchema);
export const sbtcPoolsSchema = z.array(sbtcPoolSchema);
export const allBasicConceptsSchema = z.array(basicConceptSchema);

// Type exports for Zod schemas (avoiding conflicts with generated types)
export type ZodPost = z.infer<typeof postSchema>;
export type ZodSbtcPool = z.infer<typeof sbtcPoolSchema>;
export type ZodFAQ = z.infer<typeof faqSchema>;
export type ZodFAQSection = z.infer<typeof faqSectionSchema>;
export type ZodBasicConcept = z.infer<typeof basicConceptSchema>;
