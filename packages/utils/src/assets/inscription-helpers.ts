import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  InscriptionAsset,
  InscriptionMimeType,
} from '@leather.io/models';

import { dateToUnixTimestamp } from '../time';

export function whenInscriptionMimeType<T>(
  mimeType: string,
  branches: { [k in InscriptionMimeType]?: () => T }
) {
  if (mimeType.startsWith('audio/') && branches.audio) {
    return branches.audio();
  }
  if (mimeType.startsWith('text/html') && branches.html) {
    return branches.html();
  }
  if (mimeType.startsWith('image/svg') && branches.svg) {
    return branches.svg();
  }
  if (mimeType.startsWith('image/') && branches.image) {
    return branches.image();
  }
  if (mimeType.startsWith('text') && branches.text) {
    return branches.text();
  }
  if (mimeType.startsWith('video/') && branches.video) {
    return branches.video();
  }
  if (mimeType.startsWith('model/gltf') && branches.gltf) {
    return branches.gltf();
  }
  if (branches.other) return branches.other();

  throw new Error('Unhandled inscription type');
}

export interface CreateInscriptionData {
  readonly id: string;
  readonly number: number;
  readonly contentSrc: string;
  readonly mimeType?: string;
  readonly ownerAddress: string;
  readonly satPoint: string;
  readonly genesisBlockHash: string;
  readonly genesisTimestamp: string | number;
  readonly genesisBlockHeight: number;
  readonly outputValue: string;
}

export function createInscriptionAsset(data: CreateInscriptionData): InscriptionAsset {
  const iframeSrc = `https://ordinals.com/preview/${data.id}`;
  const preview = `https://ordinals.hiro.so/inscription/${data.id}`;
  const title = `Inscription ${data.number}`;
  const [txid, output, offset] = data.satPoint.split(':');

  const sharedInfo = {
    chain: CryptoAssetChains.bitcoin,
    category: CryptoAssetCategories.nft,
    protocol: CryptoAssetProtocols.inscription,
    id: data.id,
    number: data.number,
    output,
    txid,
    offset,
    address: data.ownerAddress,
    preview,
    title,
    genesisBlockHeight: data.genesisBlockHeight,
    genesisBlockHash: data.genesisBlockHash,
    genesisTimestamp: dateToUnixTimestamp(new Date(data.genesisTimestamp)),
    value: data.outputValue,
  };

  if (!data.mimeType) {
    return {
      ...sharedInfo,
      mimeType: 'other',
      src: '',
    };
  }

  return whenInscriptionMimeType<InscriptionAsset>(data.mimeType, {
    audio: () => ({
      ...sharedInfo,
      mimeType: 'audio',
      name: 'inscription',
      src: iframeSrc,
    }),
    gltf: () => ({
      ...sharedInfo,
      mimeType: 'gltf',
      name: 'inscription',
      src: iframeSrc,
    }),
    html: () => ({
      ...sharedInfo,
      mimeType: 'html',
      name: 'inscription',
      src: iframeSrc,
    }),
    image: () => ({
      ...sharedInfo,
      mimeType: 'image',
      name: 'inscription',
      src: data.contentSrc,
    }),
    svg: () => ({
      ...sharedInfo,
      mimeType: 'svg',
      name: 'inscription',
      src: iframeSrc,
    }),
    text: () => ({
      ...sharedInfo,
      mimeType: 'text',
      name: 'inscription',
      src: data.contentSrc,
    }),
    video: () => ({
      ...sharedInfo,
      mimeType: 'video',
      name: 'inscription',
      src: iframeSrc,
    }),
    other: () => ({
      ...sharedInfo,
      mimeType: 'other',
      name: 'inscription',
      src: '',
    }),
  });
}
