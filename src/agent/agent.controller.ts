import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ChatAgentDto } from './dto/chat-agent.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  chat(@Body() chatDto: ChatAgentDto) {
    return this.agentService.handleQuery(chatDto);
  }
}
