export type OnboardingValidationResponse = {
  needsRetry: boolean;
  fullName: string | null;
  group: string | null;
  retryMessage: string | null;
};
