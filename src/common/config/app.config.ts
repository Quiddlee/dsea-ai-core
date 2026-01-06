import { registerAs } from '@nestjs/config';

export const appConfiguration = registerAs('app', () => ({
  port: Number(process.env.PORT) ?? 3000,
  artifactsDir: process.env.ARTIFACTS_DIR as string,
  database: {
    url: process.env.DATABASE_URL,
  },
  aiCoreInternalToken: process.env.AI_CORE_INTERNAL_TOKEN,
  chunking: {
    encodingTokenizer: process.env.ENCODING_TOKENIZER as 'cl100k_base',
    text: {
      size: Number(process.env.CHUNK_SIZE_TEXT),
      overlap: Number(process.env.CHUNK_OVERLAP_TEXT),
    },
    pdf: {
      size: Number(process.env.CHUNK_SIZE_PDF),
      overlap: Number(process.env.CHUNK_OVERLAP_PDF),
    },
    image: {
      size: Number(process.env.CHUNK_SIZE_IMAGE),
      overlap: Number(process.env.CHUNK_OVERLAP_IMAGE),
    },
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  embedding: {
    model: process.env.EMBEDDING_MODEL as string,
    dimensions: Number(process.env.EMBEDDING_DIMENSIONS),
  },
}));
