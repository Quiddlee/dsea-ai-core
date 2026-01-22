import { Module } from '@nestjs/common';
import { GradebookService } from './gradebook.service';
import {
  GOOGLE_SHEETS_GRADEBOOK_PROVIDER,
  googleSheetsGradebookProvider,
} from './providers/googleSheetsGradebookProvider';

@Module({
  providers: [GradebookService, ...googleSheetsGradebookProvider],
  exports: [GOOGLE_SHEETS_GRADEBOOK_PROVIDER],
})
export class GradebookModule {}
