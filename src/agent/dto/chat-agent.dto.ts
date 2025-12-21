import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChatAgentDto {
  @IsNumber()
  @IsNotEmpty()
  telegramId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}
