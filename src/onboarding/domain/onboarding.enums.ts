import { OnboardingStatus } from '../../schema';
import { ExtractEnumValues } from '../../common/types/db';

export const ONBOARDING_STATUS: ExtractEnumValues<OnboardingStatus> = {
  ACTIVE: 'active',
  ONBOARDING: 'onboarding',
};
