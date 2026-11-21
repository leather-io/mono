import { bytes, text, tuple, uint } from '@leather.io/kernel';

const u32BigEndian = uint(4, 'big');
const u64BigEndian = uint(8, 'big');

export const proposalPreimageCodec = tuple(
  text(u32BigEndian),
  text(u32BigEndian),
  bytes(u32BigEndian),
  u64BigEndian
);
