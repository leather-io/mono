interface FaqItem {
  id: string;
  question: string;
  answer: string;
  learnMoreSlug?: string;
}

export const bitcoinStakingFaqItems: FaqItem[] = [
  {
    id: 'what-is-bitcoin-staking',
    question: 'What is Bitcoin Staking?',
    answer:
      'Bitcoin Staking (PoX-5) is the successor to Stacking: you lock your STX with a pool and earn variable yield paid in sBTC. Pools operate through on-chain signer-manager contracts and your rewards accrue every cycle.',
  },
  {
    id: 'how-do-rewards-work',
    question: 'How do rewards work?',
    answer:
      'Rewards accrue as sBTC on Stacks each cycle and are claimed through the pool signer-manager contract. Yield is variable: it depends on network-wide staking participation and the protocol reward waterfall. Some pools can optionally pay out to a Bitcoin address as an sBTC withdrawal.',
  },
  {
    id: 'how-long-are-locks',
    question: 'How long is my STX locked?',
    answer:
      'You choose between 1 and 96 cycles, and a cycle is about two weeks. That sets how often you need to renew rather than how long you are stuck: you can unstake at any time and your STX unlocks when the current cycle ends. At the maximum of 96 cycles you only renew about once every four years, or when the Proof of Transfer contract is upgraded.',
  },
  {
    id: 'what-is-the-minimum',
    question: 'What is the minimum to participate?',
    answer:
      'Each pool sets its own minimum. Separately, a pool needs at least 50,000 STX staked in total to earn rewards for a cycle — small or new pools below that threshold earn nothing until they grow.',
  },
  {
    id: 'what-happened-to-stacking',
    question: 'What happened to Stacking (pox-4)?',
    answer:
      'PoX-5 replaces the previous staking protocol entirely. When it activates, STX locked under pox-4 unlocks and every participant needs to re-stake through a PoX-5 pool to keep earning.',
  },
  {
    id: 'what-happened-to-dual-stacking',
    question: 'What happened to Dual Stacking?',
    answer:
      'Dual Stacking is winding down and transitions to Bitcoin Staking on August 24, 2026. It keeps paying out until then. Separately, STX locked under pox-4 unlocks at the hard fork, so you still need to re-stake through a PoX-5 pool to keep earning — staking on this page is how you do that.',
  },
];
