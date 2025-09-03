import { defineField, defineType } from 'sanity';

export const sbtcPoolType = defineType({
  name: 'sbtcPool',
  title: 'SBTC Pool',
  type: 'document',
  fields: [
    defineField({
      name: 'id',
      title: 'Pool ID',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'tvl',
      title: 'Total Value Locked (BTC)',
      type: 'string',
      description: 'e.g. 1,880 BTC',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'tvlUsd',
      title: 'Total Value Locked (USD)',
      type: 'string',
      description: 'e.g. $113,960,000',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'minCommitment',
      title: 'Minimum Commitment (BTC)',
      type: 'string',
      description: 'e.g. 0.01 BTC',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'minCommitmentUsd',
      title: 'Minimum Commitment (USD)',
      type: 'string',
      description: 'e.g. $605.00',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'apr',
      title: 'APR',
      type: 'string',
      description: 'e.g. 5.2%',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'payoutToken',
      title: 'Payout Token',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Pool URL',
      type: 'url',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      validation: rule => rule.required(),
    }),
  ],
});
