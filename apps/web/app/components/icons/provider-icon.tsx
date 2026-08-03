import { ProviderId, providerIdSchema } from '~/data/data';

import { ImgFillLoader } from '../img-loader';

interface ProviderIconConfig {
  src: string;
  fill: string;
}

const stackingProviderIconConfig: Record<ProviderId, ProviderIconConfig> = {
  fastPool: { src: '/icons/fastpool.svg', fill: '#7A6FB0' },
  fastPoolV2: { src: '/icons/fastpool.svg', fill: '#7A6FB0' },
  planbetter: { src: '/icons/planbetter.webp', fill: 'black' },
  restake: { src: '/icons/restake.webp', fill: '#124044' },
  xversePool: { src: '/icons/xverse.webp', fill: 'black' },
  stackingDao: { src: '/icons/stacking-dao.webp', fill: '#1C3830' },
  senseiNode: { src: '/icons/senseinode.svg', fill: '#3F3FF9' },
  lisa: { src: '/icons/lisa.webp', fill: '#FB9DF1' },
};

interface ProviderIconProps {
  providerId: string;
  size?: string;
}

export function ProviderIcon({ providerId, size = '24' }: ProviderIconProps) {
  const provider = providerIdSchema.safeParse(providerId);
  if (!provider.success) return null;
  const config = stackingProviderIconConfig[provider.data];
  return <ImgFillLoader src={config.src} width={size} fill={config.fill} />;
}
