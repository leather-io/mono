import zxcvbn, { type ZXCVBNResult, type ZXCVBNScore } from 'zxcvbn';

function truncateCpuDemandingPassword(input: string) {
  return input.slice(0, 100);
}

export const PasswordStrength = {
  NoScore: 0,
  PoorScore: 1,
  WeakScore: 2,
  AverageScore: 3,
  StrongScore: 4,
  MeetsAllRequirements: 5,
} as const;
export type PasswordStrength = (typeof PasswordStrength)[keyof typeof PasswordStrength];

const requiredStrengthScore: ZXCVBNScore = PasswordStrength.StrongScore;

const requiredPasswordLength = 12;

function hasHighestPasswordScore(score: ZXCVBNScore) {
  return score >= requiredStrengthScore;
}

function hasSufficientLength(input: string) {
  return input.length >= requiredPasswordLength;
}

export interface ValidatedPassword extends ZXCVBNResult {
  meetsLengthRequirement: boolean;
  meetsScoreRequirement: boolean;
  meetsAllStrengthRequirements: boolean;
  password: string;
}

export function validatePassword(input: string): ValidatedPassword {
  const password = input.length > 100 ? truncateCpuDemandingPassword(input) : input;
  const result = zxcvbn(password);
  const meetsScoreRequirement = hasHighestPasswordScore(result.score);
  const meetsLengthRequirement = hasSufficientLength(input);
  const meetsAllStrengthRequirements = meetsScoreRequirement && meetsLengthRequirement;

  return Object.freeze({
    ...result,
    meetsScoreRequirement,
    meetsLengthRequirement,
    meetsAllStrengthRequirements,
    password,
  });
}

export const blankPasswordValidation = Object.freeze(validatePassword(''));
