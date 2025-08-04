import { t } from '@lingui/core/macro';

import {
  AlexLogo,
  ArkadikoLogo,
  BitflowLogo,
  CharismaLogo,
  FastPoolLogo,
  GraniteLogo,
  HermeticaLogo,
  LeatherLogo,
  LisaLogo,
  PlanBetterLogo,
  RestakeLogo,
  StackingDaoLogo,
  VelarLogo,
  XverseLogo,
  ZestLogo,
} from '@leather.io/ui/native';

export function getDappMap() {
  return {
    alex: {
      icon: AlexLogo,
      title: t`Alex`,
      url: 'https://alexlab.co',
    },
    lisa: {
      icon: LisaLogo,
      title: t`Lisa`,
      url: 'https://lisalab.io',
    },
    arkadiko: {
      icon: ArkadikoLogo,
      title: t`Arkadiko`,
      url: 'https://arkadiko.finance',
    },
    planbetter: {
      icon: PlanBetterLogo,
      title: t`PlanBetter`,
      url: 'https://planbetter.com',
    },
    bitflow: {
      icon: BitflowLogo,
      title: t`Bitflow`,
      url: 'https://www.bitflow.finance',
    },
    restake: {
      icon: RestakeLogo,
      title: t`Restake`,
      url: 'https://restake.net',
    },
    charisma: {
      icon: CharismaLogo,
      title: t`Charisma`,
      url: 'https://charisma.rocks',
    },
    stackingdao: {
      icon: StackingDaoLogo,
      title: t`StackingDAO`,
      url: 'https://stackingdao.com',
    },
    fastpool: {
      icon: FastPoolLogo,
      title: t`FastPool`,
      url: 'https://fastpool.org',
    },
    velar: {
      icon: VelarLogo,
      title: t`Velar`,
      url: 'https://velar.com',
    },
    granite: {
      icon: GraniteLogo,
      title: t`Granite`,
      url: 'https://granite.world',
    },
    xverse: {
      icon: XverseLogo,
      title: t`Xverse`,
      url: 'https://xverse.app',
    },
    hermetica: {
      icon: HermeticaLogo,
      title: t`Hermetica`,
      url: 'https://hermetica.fi',
    },
    zest: {
      icon: ZestLogo,
      title: t`Zest`,
      url: 'https://zestprotocol.com',
    },
    leather: {
      icon: LeatherLogo,
      title: t`Leather`,
      url: 'https://leather.io',
    },
  };
}
