/**
 * Inpage Script (LeatherProvider) <-> Content Script
 */
export const DomEventName = {
  request: 'request',
} as const;
export type DomEventName = (typeof DomEventName)[keyof typeof DomEventName];
