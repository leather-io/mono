interface CrossOriginFrameRequestArgs {
  origin: string | null;
  topOrigin: string | null;
  frameId: number;
}

export function isCrossOriginFrameRequest({
  origin,
  topOrigin,
  frameId,
}: CrossOriginFrameRequestArgs): boolean {
  if (frameId === 0) return false;
  if (!topOrigin) return true;
  return topOrigin !== origin;
}
