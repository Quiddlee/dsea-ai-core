import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as sc from '../schema';
import { messages, NewMessage } from '../schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class MessagesRepository {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase<typeof sc>,
  ) {}

  async hasMessagesHistory(userId: string) {
    const res = await this.db.query.messages.findFirst({
      where: eq(messages.userId, userId),
      columns: { id: true },
    });

    return Boolean(res?.id);
  }

  async append(data: NewMessage) {
    return (await this.db.insert(messages).values(data).returning()).at(0)!;
  }
}
