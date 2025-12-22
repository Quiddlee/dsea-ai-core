import { Injectable } from '@nestjs/common';
import { ChatAgentDto } from './dto/chat-agent.dto';
import { LlmService } from '../llm/llm.service';
import { UsersRepository } from '../users/users.repository';
import { OnboardingService } from '../onboarding/onboarding.service';
import { ONBOARDING_STATUS } from '../onboarding/domain/onboarding.enums';
import { MessagesRepository } from '../messages/messages.repository';
import { GREETINGS_MESSAGE } from '../onboarding/domain/onboarding.constants';
import { MESSAGE_ROLE } from '../messages/domain/messages.enums';

@Injectable()
export class AgentService {
  constructor(
    private readonly llmService: LlmService,
    private readonly onboardingService: OnboardingService,
    private readonly usersRepository: UsersRepository,
    private readonly messagesRepository: MessagesRepository,
  ) {}

  async handleQuery({ message, telegramId }: ChatAgentDto) {
    const user =
      await this.usersRepository.findFirstOrCreateByTelegramId(telegramId);
    const hasMessagesHistory = await this.messagesRepository.hasMessagesHistory(
      user.id,
    );

    await this.messagesRepository.append({
      userId: user.id,
      content: message,
      role: MESSAGE_ROLE.USER,
    });

    if (!hasMessagesHistory) {
      return this.sendGreeting(user.id);
    }

    if (user.onboardingStatus === ONBOARDING_STATUS.ONBOARDING) {
      return this.onboardingService.handleOnboardingFlow(user.id, message);
    }

    return this.handleAgentReply(user.id, message);
  }

  private async sendGreeting(userId: string) {
    await this.messagesRepository.append({
      userId,
      content: GREETINGS_MESSAGE,
      role: MESSAGE_ROLE.SYSTEM,
    });

    return GREETINGS_MESSAGE;
  }

  private async handleAgentReply(userId: string, userMessage: string) {
    const agentReply = await this.llmService.generate(userMessage);

    await this.messagesRepository.append({
      userId,
      content: agentReply,
      role: MESSAGE_ROLE.AGENT,
    });

    return agentReply;
  }
}
