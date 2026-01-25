import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { GradebookService } from './gradebook.service';
import { Tool } from '@rekog/mcp-nest';

const sheetTitleSchema = z.object({
  sheetTitle: z.string(),
});

const studentLookupSchema = sheetTitleSchema.extend({
  lastName: z.string(),
});

type StudentLookupParams = z.infer<typeof studentLookupSchema>;

@Injectable()
export class GradebookTool {
  constructor(private readonly gradebookService: GradebookService) {}

  @Tool({
    name: 'get-all-sheet-title-list',
    description:
      'Returns the list of worksheet titles from the gradebook spreadsheet',
  })
  async getAllSheetTitleList() {
    const sheetTitles = this.gradebookService.getAllSheetTitleList();

    return {
      isError: false,
      data: {
        titles: sheetTitles,
      },
    };
  }

  @Tool({
    name: 'get-student-status-by-last-name',
    description:
      'Returns student status by last name from a specific gradebook sheet',
    parameters: studentLookupSchema,
  })
  async getStudentStatusFromSheetByLastName({
    sheetTitle,
    lastName,
  }: StudentLookupParams) {
    const status =
      await this.gradebookService.getStudentStatusFromSheetByLastName(
        sheetTitle,
        lastName,
      );

    return {
      isError: false,
      data: {
        sheetTitle,
        lastName,
        status,
      },
    };
  }

  @Tool({
    name: 'get-study-funding-type-by-last-name',
    description:
      'Returns study funding type by last name from a specific gradebook sheet',
    parameters: studentLookupSchema,
  })
  async getStudyFundingTypeFromSheetByStudentsLastName({
    sheetTitle,
    lastName,
  }: StudentLookupParams) {
    const fundingType =
      await this.gradebookService.getStudyFundingTypeFromSheetByStudentsLastName(
        sheetTitle,
        lastName,
      );

    return {
      isError: false,
      data: {
        sheetTitle,
        lastName,
        fundingType,
      },
    };
  }

  @Tool({
    name: 'get-all-discipline-grades-by-last-name',
    description:
      'Returns all discipline grades by last name from a specific gradebook sheet',
    parameters: studentLookupSchema,
  })
  async getAllDisciplineGradesFromSheetByStudentLastName({
    sheetTitle,
    lastName,
  }: StudentLookupParams) {
    const grades =
      await this.gradebookService.getAllDisciplineGradesFromSheetByStudentLastName(
        sheetTitle,
        lastName,
      );

    return {
      isError: false,
      data: {
        sheetTitle,
        lastName,
        disciplines: grades,
      },
    };
  }
}
