import { MessageRole } from '../../schema';
import { ExtractEnumValues } from '../../common/types/db';

export const MESSAGE_ROLE: ExtractEnumValues<MessageRole> = {
  SYSTEM: 'system',
  USER: 'user',
  AGENT: 'agent',
};
