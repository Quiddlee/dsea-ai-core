import { Module } from '@nestjs/common';
import {
  TEXT_SPLITTER_PROVIDER,
  textSplitterProvider,
} from './textSplitter.provider';

@Module({
  providers: [...textSplitterProvider],
  exports: [TEXT_SPLITTER_PROVIDER],
})
export class TextSplitterModule {}
