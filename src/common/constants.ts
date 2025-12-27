import { DocumentTypes } from './types/db';

export const DOCUMENT_STATUS = {
  DISCOVERED: 'DISCOVERED',
  FETCHED: 'FETCHED',
  PARSED: 'PARSED',
  CHUNKING: 'CHUNKING',
  CHUNKED: 'CHUNKED',
  EMBED_QUEUED: 'EMBED_QUEUED',
  EMBEDDED: 'EMBEDDED',
  FAILED: 'FAILED',
} as const;

export const DOCUMENT_TYPE = {
  IMAGE: 'IMAGE',
  PDF: 'PDF',
  TEXT: 'TEXT',
} as const;

export const CHUNK_CONFIG: Record<
  DocumentTypes,
  { size: number; overlap: number }
> = {
  [DOCUMENT_TYPE.PDF]: {
    size: Number(process.env.CHUNK_SIZE_PDF!),
    overlap: Number(process.env.CHUNK_OVERLAP_PDF!),
  },
  [DOCUMENT_TYPE.TEXT]: {
    size: Number(process.env.CHUNK_SIZE_TEXT),
    overlap: Number(process.env.CHUNK_OVERLAP_TEXT),
  },
  [DOCUMENT_TYPE.IMAGE]: {
    size: Number(process.env.CHUNK_SIZE_IMAGE),
    overlap: Number(process.env.CHUNK_OVERLAP_IMAGE),
  },
};
