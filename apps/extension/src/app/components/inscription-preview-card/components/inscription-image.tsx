import { styled } from 'leather-styles/jsx';

interface InscriptionImageProps {
  src: string;
}
export function InscriptionImage({ src }: InscriptionImageProps) {
  return (
    <styled.img
      src={src}
      width="100%"
      height="100%"
      aspectRatio="1 / 1"
      objectFit="cover"
    />
  );
}
