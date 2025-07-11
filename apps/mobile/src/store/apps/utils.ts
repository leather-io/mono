import z from 'zod';

const baseAppSchema = z.object({
  origin: z.string(),
  screenshot: z.union([z.string(), z.null()]),
  name: z.string(),
});

const connectedAppSchema = z.intersection(
  baseAppSchema,
  z.object({
    status: z.literal('connected'),
    accountId: z.string(),
  })
);

export type ConnectedApp = z.infer<typeof connectedAppSchema>;

const recentlyVisitedAppSchema = z.intersection(
  baseAppSchema,
  z.object({
    status: z.literal('recently_visited'),
  })
);
export type RecentlyVisitedApp = z.infer<typeof recentlyVisitedAppSchema>;

export const appSchema = z.union([connectedAppSchema, recentlyVisitedAppSchema]);

export type AppStatus = z.infer<typeof appSchema>['status'];

export type App = z.infer<typeof appSchema>;

export function assertAppIsConnected(app: App): asserts app is ConnectedApp {
  if (app.status !== 'connected') throw new Error('App is not connected');
}
