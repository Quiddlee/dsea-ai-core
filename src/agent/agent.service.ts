import { Inject, Injectable } from '@nestjs/common';
import { ChatAgentDto } from './dto/chat-agent.dto';
import { LlmService } from '../llm/llm.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../schema';
import { DrizzleAsyncProvider } from 'src/drizzle/drizzle.provider';
import { eq } from 'drizzle-orm';
import {
  ONBOARDING_MESSAGE,
  ONBOARDING_SUCCESS,
  ONBOARDING_VALIDATION_PROMPT,
  USER_MESSAGE_PLACEHOLDER,
} from './agent.constants';
import { OnboardingValidationResponse } from './domain/agent.types';

@Injectable()
export class AgentService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof sc>,
    private readonly llmService: LlmService,
  ) {}

  async handleQuery({ message, telegramId }: ChatAgentDto) {
    // query user
    const userQueryResult = await this.db
      .select()
      .from(sc.users)
      .where(eq(sc.users.telegramId, telegramId));
    const user = userQueryResult.at(0);

    if (!user) {
      // create user
      await this.db.insert(sc.users).values({ telegramId });

      return ONBOARDING_MESSAGE;
    }

    if (user?.onboardingStatus === 'onboarding') {
      // validate onboarding
      const onboardingData = await this.validateOnboardingData(message);

      if (onboardingData.needsRetry) {
        return onboardingData.retryMessage;
      }

      // save user data to db
      await this.db
        .update(sc.users)
        .set({
          fullName: onboardingData.fullName,
          group: onboardingData.group,
          activatedAt: new Date(),
        })
        .where(eq(sc.users.telegramId, telegramId));

      return ONBOARDING_SUCCESS;
    }

    return this.llmService.generate(message);
  }

  private async validateOnboardingData(message: string) {
    const validationResult = await this.llmService.generate(
      ONBOARDING_VALIDATION_PROMPT.replace(USER_MESSAGE_PLACEHOLDER, message),
    );

    return JSON.parse(
      validationResult,
    ) as unknown as OnboardingValidationResponse;
  }

  private async findOrCreateByTelegramId(telegramId: number) {
    const result = await this.db
      .select()
      .from(sc.users)
      .where(eq(sc.users.telegramId, telegramId));
    const user = result.at(0);

    if (user) {
      return user;
    }

    const createdUserResult = await this.db
      .insert(sc.users)
      .values({ telegramId })
      .returning();
    const createdUser = createdUserResult.at(0);

    return createdUser;
  }
}
