import { t } from '@lingui/macro';

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
      title: t({ id: 'dapps.alex', message: 'Alex' }),
      url: 'https://alexlab.co',
    },
    lisa: {
      icon: LisaLogo,
      title: t({ id: 'dapps.lisa', message: 'Lisa' }),
      url: 'https://lisalab.io',
    },
    arkadiko: {
      icon: ArkadikoLogo,
      title: t({ id: 'dapps.arkadiko', message: 'Arkadiko' }),
      url: 'https://arkadiko.finance',
    },
    planbetter: {
      icon: PlanBetterLogo,
      title: t({ id: 'dapps.planbetter', message: 'PlanBetter' }),
      url: 'https://planbetter.com',
    },
    bitflow: {
      icon: BitflowLogo,
      title: t({ id: 'dapps.bitflow', message: 'Bitflow' }),
      url: 'https://www.bitflow.finance',
    },
    restake: {
      icon: RestakeLogo,
      title: t({ id: 'dapps.restake', message: 'Restake' }),
      url: 'https://restake.net',
    },
    charisma: {
      icon: CharismaLogo,
      title: t({ id: 'dapps.charisma', message: 'Charisma' }),
      url: 'https://charisma.rocks',
    },
    stackingdao: {
      icon: StackingDaoLogo,
      title: t({ id: 'dapps.stackingdao', message: 'StackingDAO' }),
      url: 'https://stackingdao.com',
    },
    fastpool: {
      icon: FastPoolLogo,
      title: t({ id: 'dapps.fastpool', message: 'FastPool' }),
      url: 'https://fastpool.org',
    },
    velar: {
      icon: VelarLogo,
      title: t({ id: 'dapps.velar', message: 'Velar' }),
      url: 'https://velar.com',
    },
    granite: {
      icon: GraniteLogo,
      title: t({ id: 'dapps.granite', message: 'Granite' }),
      url: 'https://granite.world',
    },
    xverse: {
      icon: XverseLogo,
      title: t({ id: 'dapps.xverse', message: 'Xverse' }),
      url: 'https://xverse.app',
    },
    hermetica: {
      icon: HermeticaLogo,
      title: t({ id: 'dapps.hermetica', message: 'Hermetica' }),
      url: 'https://hermetica.fi',
    },
    zest: {
      icon: ZestLogo,
      title: t({ id: 'dapps.zest', message: 'Zest' }),
      url: 'https://zestprotocol.com',
    },
    leather: {
      icon: LeatherLogo,
      title: t({ id: 'dapps.leather', message: 'Leather' }),
      url: 'https://leather.io',
    },
  };
}
