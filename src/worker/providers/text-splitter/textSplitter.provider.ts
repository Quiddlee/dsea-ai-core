import { TokenTextSplitter } from '@langchain/textsplitters';

export const TEXT_SPLITTER_PROVIDER = Symbol('TEXT_SPLITTER_PROVIDER');

export const textSplitterProvider = [
  {
    provide: TEXT_SPLITTER_PROVIDER,
    useFactory: () => {
      return new TokenTextSplitter({
        encodingName: 'cl100k_base',
        chunkSize: process.env.CHUNK_SIZE_TEXT as unknown as number,
        chunkOverlap: process.env.CHUNK_OVERLAP_TEXT as unknown as number,
      });
    },
  },
];
