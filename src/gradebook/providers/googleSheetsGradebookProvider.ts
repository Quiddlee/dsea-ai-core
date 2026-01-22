import { appConfiguration } from '../../common/config/app.config';
import { AppConfig } from '../../common/types/environment';
import { GoogleSpreadsheet } from 'google-spreadsheet';

export const GOOGLE_SHEETS_GRADEBOOK_PROVIDER = Symbol(
  'GOOGLE_SHEETS_GRADEBOOK_PROVIDER',
);

export const googleSheetsGradebookProvider = [
  {
    provide: GOOGLE_SHEETS_GRADEBOOK_PROVIDER,
    inject: [appConfiguration.KEY],
    useFactory: async (appConfig: AppConfig) => {
      const doc = new GoogleSpreadsheet(appConfig.gradebook.spreadsheetId, {
        apiKey: appConfig.googleCloud.apiKey,
      });

      await doc.loadInfo();

      return doc;
    },
  },
];
