import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as sc from '../schema';
import { User, users } from '../schema';
import { DRIZZLE_ASYNC_PROVIDER } from '../drizzle/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase<typeof sc>,
  ) {}

  async findFirstOrCreateByTelegramId(telegramId: number) {
    let user = await this.db.query.users.findFirst({
      where: eq(users.telegramId, telegramId),
    });

    if (!user) {
      [user] = await this.db
        .insert(users)
        .values({ telegramId })
        .onConflictDoNothing({ target: users.telegramId })
        .returning();
    }

    return user;
  }

  async updateUserById(id: string, data: Partial<User>) {
    return this.db.update(users).set(data).where(eq(users.id, id));
  }
}
