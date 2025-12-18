import { IsNotEmpty, IsString } from 'class-validator';

export class ChatAgentDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
