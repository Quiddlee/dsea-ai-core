import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as sc from '../../schema';
import { DOCUMENT_STATUS, DOCUMENT_TYPE } from '../constants';
import { ExtractValues } from './utils';

export type ExtractEnumValues<T extends string> = {
  [K in Uppercase<T>]: Lowercase<K>;
};

export type Schema = NodePgDatabase<typeof sc>;

export type DocumentStatus = ExtractValues<typeof DOCUMENT_STATUS>;

export type DocumentTypes = ExtractValues<typeof DOCUMENT_TYPE>;
