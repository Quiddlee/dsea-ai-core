import {
  bigint,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', [
  'student',
  'applicant',
  'admin',
] as const);

export const onboardingStatusEnum = pgEnum('onboarding_status', [
  'onboarding',
  'active',
] as const);

export const messageRoleEnum = pgEnum('message_role', [
  'user',
  'agent',
  'system',
] as const);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  telegramId: bigint('telegram_id', { mode: 'number' }).notNull().unique(),
  fullName: text('full_name'),

  group: text('group'),

  role: userRoleEnum('role').notNull().default('student'),

  onboardingStatus: onboardingStatusEnum('onboarding_status')
    .notNull()
    .default('onboarding'),

  activatedAt: timestamp('activated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type OnboardingStatus = (typeof onboardingStatusEnum.enumValues)[number];

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  role: messageRoleEnum('role').notNull(),
  content: text('content').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;
export type MessageRole = (typeof messageRoleEnum.enumValues)[number];
