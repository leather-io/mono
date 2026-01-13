const supportedSip9ContentTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'image/avif',
  'video/mp4',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
  'audio/webm',
  'text/plain',
  'application/octet-stream',
  'model/gltf+json',
  'model/gltf-binary',
] as const;

const supportedContentTypesSet = new Set<string>(supportedSip9ContentTypes);

export type Sip9SupportedContentType = (typeof supportedSip9ContentTypes)[number];

export interface Sip9MediaInfo {
  contentType: Sip9SupportedContentType | null;
  isVideo: boolean;
  isImage: boolean;
  isAudio: boolean;
}

function isSupportedContentType(
  contentType: string | null
): contentType is Sip9SupportedContentType {
  if (contentType === null) return false;
  return supportedContentTypesSet.has(contentType);
}

function inferFromExtension(url: string): Sip9MediaInfo {
  const extension = url.split('.').pop()?.toLowerCase() ?? '';
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const audioExtensions = ['mp3', 'wav', 'ogg'];

  return {
    contentType: null,
    isVideo: videoExtensions.includes(extension),
    isImage: imageExtensions.includes(extension),
    isAudio: audioExtensions.includes(extension),
  };
}

export async function getSip9MediaInfo(url: string): Promise<Sip9MediaInfo> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        Range: 'bytes=0-0',
      },
    });

    const rawContentType = response.headers.get('content-type');
    const contentType = isSupportedContentType(rawContentType) ? rawContentType : null;

    return {
      contentType,
      isVideo: contentType?.startsWith('video/') ?? false,
      isImage: contentType?.startsWith('image/') || contentType === 'application/octet-stream',
      isAudio: contentType?.startsWith('audio/') ?? false,
    };
  } catch {
    return inferFromExtension(url);
  }
}

export function getSip9ContentTypeList() {
  return [...supportedSip9ContentTypes];
}
