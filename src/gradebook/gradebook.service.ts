import { Inject, Injectable } from '@nestjs/common';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetCell,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import {
  DisciplineContentMap,
  DisciplineResultMap,
} from './domain/gradebook.types';
import { GOOGLE_SHEETS_GRADEBOOK_PROVIDER } from './providers/googleSheetsGradebookProvider';
import { GRADEBOOK_DISCIPLINE_DATA_INTERNAL_FIELDS } from './domain/gradebook.constants';

@Injectable()
export class GradebookService {
  private readonly missingFieldsThreshold = 5;
  private readonly disciplineContentMapActualContentStartRow = 2;
  private readonly groupCodeCol = 'A';
  private readonly disciplineNameCol = 'B';
  private readonly academicSemesterCol = 'C';
  private readonly assessmentTypeCol = 'D';
  private readonly responsibleDepartmentCol = 'E';
  private readonly moodleLinkCol = 'F';
  private readonly disciplineContentMapColList = [
    this.groupCodeCol,
    this.disciplineNameCol,
    this.academicSemesterCol,
    this.assessmentTypeCol,
    this.responsibleDepartmentCol,
    this.moodleLinkCol,
  ];

  constructor(
    @Inject(GOOGLE_SHEETS_GRADEBOOK_PROVIDER)
    private readonly googleSheetsGradebookDoc: GoogleSpreadsheet,
  ) {}

  getAllSheetTitleList() {
    return this.googleSheetsGradebookDoc.sheetsByIndex.map(
      (sheet) => sheet.title,
    );
  }

  async getAllDisciplineGradesFromSheetByStudentLastName(
    sheetTitle: string,
    lastName: string,
  ) {
    const sheet = await this.findSheetByName(
      this.googleSheetsGradebookDoc,
      sheetTitle,
    );

    if (!sheet) {
      console.warn(`No sheet found for: ${sheetTitle}`);
      return new Set();
    }

    const studentsLastNameA1Address = this.findA1AddressByContent(
      sheet,
      lastName,
    );

    if (!studentsLastNameA1Address) {
      console.warn(`No a1Address found for: ${lastName}`);
      return new Set();
    }

    const disciplineInfoContentMap = this.initDisciplineInfoContentMap(sheet);
    const allDisciplineData =
      this.getAllDisciplineDataByStudentsLastnameA1Address(
        sheet,
        studentsLastNameA1Address,
        disciplineInfoContentMap,
      );

    return allDisciplineData;
  }

  private async findSheetByName(doc: GoogleSpreadsheet, query: string) {
    const sheetsByTitle = doc.sheetsByTitle;
    const sheet = sheetsByTitle[query];

    await sheet.loadCells();

    console.log(`cells loaded for sheet ${query}: `, sheet.cellStats);

    return sheet;
  }

  private findA1AddressByContent(
    sheet: GoogleSpreadsheetWorksheet,
    query: string,
  ) {
    for (let row = 0; row < sheet.rowCount; row++) {
      for (let col = 0; col < sheet.columnCount; col++) {
        const cell = sheet.getCell(row, col);
        const hasValue = cell.value !== undefined && cell.value !== null;
        const isQueryMatched =
          cell.value?.toString().toLowerCase().trim() === query.toLowerCase();

        if (hasValue && isQueryMatched) {
          console.log(cell.a1Address, cell.value);
          return cell.a1Address;
        }
      }
    }

    console.warn(`Unable to find Cell by query - ${query}`);
  }

  private getAllDisciplineDataByStudentsLastnameA1Address(
    sheet: GoogleSpreadsheetWorksheet,
    a1Address: string,
    contentMap: DisciplineContentMap[],
  ) {
    const targetCellRow = Number(a1Address.slice(1));
    const targetCellCol = a1Address.slice(0, 1);
    const contentStartRowRelativeToTargetCell = targetCellRow + 1;
    const allDisciplineDataList: Set<DisciplineResultMap> = new Set();

    let currRow = contentStartRowRelativeToTargetCell;
    while (true) {
      const currDisciplineData: DisciplineResultMap = new Map();
      const currDisciplineGradeCell = sheet.getCellByA1(
        `${targetCellCol}${currRow}`,
      );

      currDisciplineData.set(
        GRADEBOOK_DISCIPLINE_DATA_INTERNAL_FIELDS.GRADE,
        currDisciplineGradeCell.value?.toString(),
      );
      currDisciplineData.set(
        GRADEBOOK_DISCIPLINE_DATA_INTERNAL_FIELDS.ACADEMIC_DEBT,
        this.hasAcademicDebt(currDisciplineGradeCell),
      );

      contentMap.forEach(({ column, label }) => {
        const content = sheet.getCellByA1(`${column}${currRow}`);
        const value = content.value?.toString().trim();

        currDisciplineData.set(label, value);
      });

      // Iterating through discipline rows until the data is invalid
      // We assume that we reached the end of all discipline list for current student
      const isReachedEndOfAllDisciplineData =
        this.isDisciplineDataInvalid(currDisciplineData);

      if (isReachedEndOfAllDisciplineData) break;

      allDisciplineDataList.add(currDisciplineData);

      currRow++;
    }

    return allDisciplineDataList;
  }

  private initDisciplineInfoContentMap(
    sheet: GoogleSpreadsheetWorksheet,
  ): DisciplineContentMap[] {
    return this.disciplineContentMapColList.map((column) => {
      const groupCodeLabel = sheet.getCellByA1(
        `${column}${this.disciplineContentMapActualContentStartRow}`,
      );

      return {
        label: groupCodeLabel.value?.toString().trim(),
        column,
      };
    });
  }

  private hasAcademicDebt(gradeCell: GoogleSpreadsheetCell) {
    // From the document statement:
    // Фактичні недопуски студентам проставляються напередодні сесії
    // шляхом позначення відповідної клітинки червоним маркером.
    return Boolean(
      gradeCell.value &&
      'rgbColor' in gradeCell.backgroundColorStyle &&
      'red' in gradeCell.backgroundColorStyle.rgbColor,
    );
  }

  private isDisciplineDataInvalid(disciplineData: DisciplineResultMap) {
    const disciplineMissingFields = [...disciplineData.values()].filter(
      (value) => !value,
    );
    return disciplineMissingFields.length >= this.missingFieldsThreshold;
  }
}
