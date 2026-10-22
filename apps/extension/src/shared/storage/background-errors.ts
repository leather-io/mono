export const backgroundErrorsStorageKey = 'verify:backgroundErrors';
export const backgroundErrorsLimit = 100;

export interface BackgroundErrorRecord {
  ts: string;
  message: string;
}
