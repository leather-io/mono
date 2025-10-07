export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  learnMoreSlug?: string;
}

export const stackingFaqItems: FaqItem[] = [
  {
    id: 'what-is-stacking',
    question: 'What is Stacking?',
    answer:
      'Stacking is a way to earn Bitcoin rewards by locking your STX tokens to support network security. Stackers help validate blocks and earn BTC rewards through the Proof of Transfer consensus mechanism.',
    learnMoreSlug: 'stacking',
  },
  {
    id: 'what-is-pooled-stacking',
    question: 'What is Pooled Stacking?',
    answer:
      'Pooled stacking allows users to combine their STX with others to meet the minimum stacking requirement. Pool operators handle the technical aspects while you earn proportional rewards.',
    learnMoreSlug: 'pooled-stacking',
  },
  {
    id: 'what-is-liquid-stacking',
    question: 'What is Liquid Stacking?',
    answer:
      'Liquid stacking protocols issue synthetic tokens representing your stacked STX, allowing you to use them in DeFi while still earning stacking rewards.',
    learnMoreSlug: 'liquid-stacking',
  },
  {
    id: 'what-is-stx-token',
    question: 'What is the STX token?',
    answer:
      'STX is the native cryptocurrency of the Stacks blockchain. It is used for transaction fees, smart contract execution, and can be locked (stacked) to earn Bitcoin rewards.',
    learnMoreSlug: 'stacks-token-stx',
  },
  {
    id: 'how-to-choose-provider',
    question: 'How do I choose a stacking provider?',
    answer:
      "Compare providers based on fees, minimum requirements, reward types (BTC or STX), historical yields, and reputation. Research each provider's track record and terms before committing.",
    learnMoreSlug: 'stacking-providers',
  },
  {
    id: 'what-rewards-will-i-earn',
    question: 'What rewards will I earn?',
    answer:
      'Stacking rewards are distributed in Bitcoin (for direct and pooled stacking) or STX (for some liquid stacking protocols). Rewards are proportional to the amount stacked and vary based on network activity.',
    learnMoreSlug: 'stacking-rewards',
  },
  {
    id: 'what-is-minimum-commitment',
    question: 'What is the minimum commitment?',
    answer:
      'Solo stacking requires a dynamic minimum (currently around 100,000 STX), while pooled stacking allows participation with much smaller amounts, typically starting from 50-100 STX.',
    learnMoreSlug: 'stacking-minimum-commitment',
  },
  {
    id: 'what-is-historical-yield',
    question: 'How is historical yield calculated?',
    answer:
      'Historical yields show past stacking returns as an annual percentage. These help estimate potential returns but do not guarantee future performance. Yields vary based on network activity and Bitcoin price.',
    learnMoreSlug: 'historical-yield',
  },
  {
    id: 'what-are-pool-fees',
    question: 'What are stacking pool fees?',
    answer:
      'Pool operators typically charge 5-15% of earned rewards as fees for their services, including technical management and reward distribution.',
    learnMoreSlug: 'stacking-pool-fees',
  },
  {
    id: 'what-are-liquid-tokens',
    question: 'What are liquid stacking tokens?',
    answer:
      'Liquid stacking tokens like stSTX or LiSTX represent your stacked STX and can be used in DeFi protocols while continuing to earn stacking rewards.',
    learnMoreSlug: 'stacking-liquid-token',
  },
];
