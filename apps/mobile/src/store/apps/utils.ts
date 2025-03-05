import z from 'zod';

const connectedAppSchema = z.object({
  status: z.literal('connected'),
  accountId: z.string(),
});
const recentlyVisitedAppSchema = z.object({
  status: z.literal('recently_visited'),
});

const baseAppSchema = z.object({
  origin: z.string(),
  icon: z.string(),
});

export const appSchema = z.intersection(
  baseAppSchema,
  z.union([connectedAppSchema, recentlyVisitedAppSchema])
);

export type AppStatus = z.infer<typeof appSchema>['status'];

export type App = z.infer<typeof appSchema>;
