export const UpdateAvailableSelectors = {
  UpdateAvailableCallout: 'update-available-callout',
  UpdateAvailableCalloutUpdateNow: 'update-available-callout-update-now',
  UpdateAvailableCalloutLater: 'update-available-callout-later',
} as const;
export type UpdateAvailableSelectors =
  (typeof UpdateAvailableSelectors)[keyof typeof UpdateAvailableSelectors];
