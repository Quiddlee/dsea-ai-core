import { TokenTextSplitter } from '@langchain/textsplitters';
import { appConfiguration } from '../../../common/config/app.config';
import { AppConfig } from '../../../common/types/environment';

export const TEXT_SPLITTER_PROVIDER = Symbol('TEXT_SPLITTER_PROVIDER');

export const textSplitterProvider = [
  {
    provide: TEXT_SPLITTER_PROVIDER,
    inject: [appConfiguration.KEY],
    useFactory: (appConfig: AppConfig) => {
      return new TokenTextSplitter({
        encodingName: appConfig.chunking.encodingTokenizer,
        chunkSize: appConfig.chunking.text.size,
        chunkOverlap: appConfig.chunking.text.overlap,
      });
    },
  },
];
