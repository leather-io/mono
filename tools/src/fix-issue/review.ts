import { existsSync, readFileSync } from 'node:fs';
import { z } from 'zod';

const lineSchema = z.string().trim().min(1, 'is empty');

const reviewSchema = z.object({
  blocking: z.array(
    z.object({
      kind: z.enum(['critical', 'blocker', 'regression']),
      location: lineSchema,
      defect: lineSchema,
      scenario: lineSchema,
    })
  ),
  minor: z.array(z.object({ location: lineSchema, note: lineSchema })).default([]),
});

export type Review = z.infer<typeof reviewSchema>;

export function readReview(file: string): Review {
  if (!existsSync(file)) throw new Error(`${file} does not exist`);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`${file} is not valid JSON: ${String(error)}`);
  }
  const result = reviewSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues.map(
      issue => `${issue.path.map(String).join('.')}: ${issue.message}`
    );
    throw new Error(`${file} is not a valid review:\n  ${problems.join('\n  ')}`);
  }
  return result.data;
}
