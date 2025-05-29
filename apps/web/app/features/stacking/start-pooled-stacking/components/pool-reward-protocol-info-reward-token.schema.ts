import { z } from 'zod';

const poolRewardProtocolInfoRewardTokens = ['BTC', 'STX'] as const;

export const poolRewardProtocolInfoRewardTokenSchema = z.enum(poolRewardProtocolInfoRewardTokens);
