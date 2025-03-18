interface PoolIconProps {
  src: string;
}

export function PoolIcon({ src }: PoolIconProps) {
  return <img src={src} width="32px" alt="name" />;
}
