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
  '',
] as const;

const supportedContentTypesSet = new Set(supportedSip9ContentTypes);

export type Sip9SupportedContentType = (typeof supportedSip9ContentTypes)[number];

export interface Sip9MediaInfo {
  contentType: Sip9SupportedContentType;
  isVideo: boolean;
  isImage: boolean;
  isAudio: boolean;
}

function isSupportedContentType(
  contentType: string | null
): contentType is Sip9SupportedContentType {
  if (contentType === null) return false;
  return supportedContentTypesSet.has(contentType as Sip9SupportedContentType);
}

function inferFromExtension(url: string): Sip9MediaInfo {
  const extension = url.split('.').pop()?.toLowerCase() ?? '';
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'm4v'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const audioExtensions = ['mp3', 'wav', 'ogg'];

  return {
    contentType: '',
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
    const contentType = isSupportedContentType(rawContentType) ? rawContentType : '';

    return {
      contentType,
      isVideo: contentType.startsWith('video/'),
      isImage: contentType.startsWith('image/') || contentType === 'application/octet-stream',
      isAudio: contentType.startsWith('audio/'),
    };
  } catch {
    return inferFromExtension(url);
  }
}

export function getSip9ContentTypeList() {
  return [...supportedSip9ContentTypes];
}

