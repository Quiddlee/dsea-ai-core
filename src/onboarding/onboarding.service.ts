import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { OnboardingValidationResponse } from './domain/onboarding.types';
import {
  MISSING_RETRY_MESSAGE,
  ONBOARDING_FAILURE_MESSAGE,
  ONBOARDING_SUCCESS,
} from './domain/onboarding.constants';
import { UsersRepository } from '../users/users.repository';
import { safeParseJSON, stringifyJSONSafe } from '../common/helpers/json';
import { MessagesRepository } from '../messages/messages.repository';
import { MESSAGE_ROLE } from '../messages/domain/messages.enums';
import { ONBOARDING_STATUS } from './domain/onboarding.enums';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly llmService: LlmService,
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository,
  ) {}

  async handleOnboardingFlow(userId: string, userDataMessage: string) {
    const onboardingData = await this.validateOnboardingData(userDataMessage);

    if (!onboardingData) {
      return this.handleFailure(userId);
    }

    if (onboardingData.needsRetry) {
      return this.handleRetry(
        userId,
        onboardingData.retryMessage ?? MISSING_RETRY_MESSAGE,
      );
    }

    return this.handleOnboardingSuccess(userId, onboardingData);
  }

  private async validateOnboardingData(message: string) {
    const validationResult =
      await this.llmService.validateOnboardingData(message);

    return safeParseJSON<OnboardingValidationResponse>(validationResult);
  }

  private async handleFailure(userId: string) {
    await this.messagesRepository.append({
      userId,
      content: ONBOARDING_FAILURE_MESSAGE,
      role: MESSAGE_ROLE.SYSTEM,
    });

    return stringifyJSONSafe({
      content: ONBOARDING_FAILURE_MESSAGE,
      filePath: null,
    });
  }

  private async handleRetry(userId: string, message: string) {
    await this.messagesRepository.append({
      userId,
      content: message,
      role: MESSAGE_ROLE.SYSTEM,
    });

    return stringifyJSONSafe({
      content: message,
      filePath: null,
    });
  }

  private async handleOnboardingSuccess(
    userId: string,
    userData: OnboardingValidationResponse,
  ) {
    await Promise.all([
      this.usersRepository.updateUserById(userId, {
        fullName: userData.fullName,
        group: userData.group,
        onboardingStatus: ONBOARDING_STATUS.ACTIVE,
        activatedAt: new Date(),
      }),

      this.messagesRepository.append({
        userId,
        content: ONBOARDING_SUCCESS,
        role: MESSAGE_ROLE.SYSTEM,
      }),
    ]);

    return stringifyJSONSafe({
      content: ONBOARDING_SUCCESS,
      filePath: null,
    });
  }
}
