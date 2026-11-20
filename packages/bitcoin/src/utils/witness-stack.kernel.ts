import { bytes, compactSize, list } from '@leather.io/kernel';

export const witnessStackCodec = list(compactSize, bytes(compactSize));
