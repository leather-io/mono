import { z } from 'zod';

const chainalysisRiskLevelSchema = z.enum(['Low', 'Medium', 'High', 'Severe']);

export type ChainalysisRiskLevel = z.infer<typeof chainalysisRiskLevelSchema>;

export const chainalysisRiskAssessmentSchema = z.object({
  risk: chainalysisRiskLevelSchema,
  riskReason: z.string().nullish(),
});

export type ChainalysisRiskAssessment = z.infer<typeof chainalysisRiskAssessmentSchema>;
