import {
  bigint,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
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
  faculty: text('faculty'),

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

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    sourceType: text('source_type').notNull(),
    sourceId: text('source_id').notNull(),
    url: text('url'),
    title: text('title'),

    mimeType: text('mime_type'),
    checksum: text('checksum').notNull(),
    status: text('status').notNull().default('DISCOVERED'),
    rawPath: text('raw_path').notNull(),

    lastError: text('last_error'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    parsedAt: timestamp('parsed_at', { withTimezone: true }),
    embeddedAt: timestamp('embedded_at', { withTimezone: true }),
  },
  (t) => ({
    sourceUq: uniqueIndex('documents_source_uq').on(t.sourceType, t.sourceId),
    statusIdx: index('documents_status_idx').on(t.status),
    updatedAtIdx: index('documents_updated_at_idx').on(t.updatedAt),
  }),
);

export type Documents = InferSelectModel<typeof documents>;
export type NewDocuments = InferInsertModel<typeof documents>;

export const documentChunks = pgTable(
  'document_chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),

    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    contentHash: text('content_hash').notNull(),

    pageStart: integer('page_start'),
    pageEnd: integer('page_end'),

    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    docChunkUq: uniqueIndex('document_chunks_uq').on(
      t.documentId,
      t.chunkIndex,
    ),
    documentIdIdx: index('document_chunks_document_id_idx').on(t.documentId),
    contentHashIdx: index('document_chunks_content_hash_idx').on(t.contentHash),
  }),
);

export type DocumentChunks = InferSelectModel<typeof documentChunks>;
export type NewDocumentChunks = InferInsertModel<typeof documentChunks>;

export const documentChunkEmbeddings = pgTable(
  'document_chunk_embeddings',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    chunkId: uuid('chunk_id')
      .notNull()
      .references(() => documentChunks.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),

    model: text('model').notNull(),
    embedding: vector('embedding', {
      dimensions: Number(process.env.EMBEDDING_DIMENSIONS),
    }).notNull(),

    contentHash: text('content_hash').notNull(),

    metadata: jsonb('metadata').notNull().default({}),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uq: uniqueIndex('chunk_embeddings_uq').on(
      t.chunkId,
      t.model,
      t.contentHash,
    ),

    chunkIdIdx: index('chunk_embeddings_chunk_id_idx').on(t.chunkId),
    modelIdx: index('chunk_embeddings_model_idx').on(t.model),

    embeddingHnswIdx: index('chunk_embeddings_embedding_hnsw_idx').using(
      'hnsw',
      t.embedding.op('vector_cosine_ops'),
    ),
  }),
);

export type DocumentChunkEmbedding = InferSelectModel<
  typeof documentChunkEmbeddings
>;
export type NewDocumentChunkEmbedding = InferInsertModel<
  typeof documentChunkEmbeddings
>;
