interface Protocol {
  name: string;
  description: string;
  url: string;
  iconKey: string;
}

interface Provider {
  name: string;
  url: string;
  iconKey: string;
}

export const protocols: Protocol[] = [
  {
    name: 'Stacking DAO',
    description: `Enjoy automatic protocol operations and auto-compounded yield. Locked STX will stay stacked indefinitely.`,
    url: 'https://www.stackingdao.com',
    iconKey: 'StackingDaoIcon',
  },
  {
    name: 'LISA',
    description: `See your balance increase automatically and always exchange at 1 STX to 1 LiSTX`,
    url: 'https://www.lisalab.io/',
    iconKey: 'LisaIcon',
  },
];

export const providers: Provider[] = [
  { name: 'Xverse', url: 'https://xverse.app', iconKey: 'XverseIcon' },
  { name: 'Fast Pool', url: 'https://fastpool.org', iconKey: 'FastPoolIcon' },
  { name: 'PlanBetter', url: 'https://planbetter.com', iconKey: 'PlanBetterIcon' },
  { name: 'Restake', url: 'https://restake.net/stacks-pool', iconKey: 'RestakeIcon' },
  { name: 'Stacking DAO', url: 'https://www.stackingdao.com', iconKey: 'StackingDaoIcon' },
  { name: 'LISA', url: 'https://www.lisalab.io', iconKey: 'LisaIcon' },
];
