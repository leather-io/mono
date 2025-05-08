import { ReactElement } from 'react';

import { ProviderId, providerIdSchema } from '~/data/data';

import { ImgFillLoader } from '../img-loader';

const stackingProviderIcons: Record<ProviderId, ReactElement> = {
  fastPool: <ImgFillLoader src="icons/fastpool.webp" width="24" fill="black" />,
  planbetter: <ImgFillLoader src="icons/planbetter.webp" width="24" fill="black" />,
  restake: <ImgFillLoader src="icons/restake.webp" width="24" fill="#124044" />,
  xverse: <ImgFillLoader src="icons/xverse.webp" width="24" fill="black" />,
  stackingDao: <ImgFillLoader src="icons/stacking-dao.webp" width="24" fill="#1C3830" />,
  lisa: <ImgFillLoader src="icons/lisa.webp" width="24" fill="#FB9DF1" />,
};

export function ProviderIcon({ providerId }: { providerId: string }) {
  const provider = providerIdSchema.safeParse(providerId);
  return provider.success ? stackingProviderIcons[provider.data] : null;
}
