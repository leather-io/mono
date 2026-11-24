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
      'You choose between 1 and 96 cycles, and a cycle is about two weeks. You can request early unstaking outside the closing window. Once the transaction confirms, your STX unlocks at the end of the current cycle. The selected duration determines when your position needs renewal.',
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
      'Positions under pox-4 do not carry over to PoX-5. Check your existing position and the current protocol status before re-staking through a PoX-5 pool.',
  },
  {
    id: 'what-happened-to-dual-stacking',
    question: 'What happened to Dual Stacking?',
    answer:
      'Basic sBTC rewards enrollment ended on August 27, 2026. Explore current STX staking pools and independent sBTC providers, and review their eligibility, rewards and payout terms. Check any existing position before starting a new one.',
  },
];
