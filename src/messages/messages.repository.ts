import { Inject, Injectable } from '@nestjs/common';
import { and, eq, not } from 'drizzle-orm';
import * as sc from '../schema';
import { messages, NewMessage, users } from '../schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class MessagesRepository {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase<typeof sc>,
  ) {}

  async hasMessagesHistory(userId: string, excludeMessageIds?: string[]) {
    const excludeMessages =
      excludeMessageIds?.map((m) => not(eq(messages.id, m))) ?? [];

    const res = this.db.query.messages.findFirst({
      where: and(eq(users.id, userId), ...excludeMessages),
      columns: { id: true },
    });

    return Boolean(res);
  }

  async append(data: NewMessage) {
    return (await this.db.insert(messages).values(data).returning()).at(0)!;
  }
}
