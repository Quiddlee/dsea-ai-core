import { Inject, Injectable } from '@nestjs/common';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetCell,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import {
  CellCoords,
  DisciplineContentMap,
  DisciplineResultMap,
} from './domain/gradebook.types';
import { GOOGLE_SHEETS_GRADEBOOK_PROVIDER } from './providers/googleSheetsGradebookProvider';
import { GRADEBOOK_DISCIPLINE_DATA_INTERNAL_FIELDS } from './domain/gradebook.constants';

@Injectable()
export class GradebookService {
  /**
   * On the 2nd row placed headers with titles describing the main content.
   * @private
   */
  private readonly disciplineContentMapActualContentStartRow = 1;

  /**
   * This value is used to check for discipline missing fields to stop the parsing.
   * @private
   */
  private readonly missingFieldsThreshold = 5;

  /**
   * All discipline cells columns are hardcoded, assuming that the layout won't change anytime soon.
   * @private
   */
  private readonly groupCodeCol = 0;
  private readonly disciplineNameCol = 1;
  private readonly academicSemesterCol = 2;
  private readonly assessmentTypeCol = 3;
  private readonly responsibleDepartmentCol = 4;
  private readonly moodleLinkCol = 5;

  private readonly disciplineContentMapColList = [
    this.groupCodeCol,
    this.disciplineNameCol,
    this.academicSemesterCol,
    this.assessmentTypeCol,
    this.responsibleDepartmentCol,
    this.moodleLinkCol,
  ] as const;

  constructor(
    @Inject(GOOGLE_SHEETS_GRADEBOOK_PROVIDER)
    private readonly googleSheetsGradebookDoc: GoogleSpreadsheet,
  ) {}

  getAllSheetTitleList() {
    return this.googleSheetsGradebookDoc.sheetsByIndex.map(
      (sheet) => sheet.title,
    );
  }

  async getStudyFundingTypeFromSheetByStudentsLastName(
    sheetTitle: string,
    lastName: string,
  ) {
    const sheet = await this.findSheetByName(
      this.googleSheetsGradebookDoc,
      sheetTitle,
    );

    if (!sheet) {
      return null;
    }

    const studentsLastNameCell = this.findCellByContent(sheet, lastName);

    if (!studentsLastNameCell) {
      return null;
    }

    const studyType = this.getStudyFundingTypeByStudentsLastNameCellAddress(
      sheet,
      [studentsLastNameCell.rowIndex, studentsLastNameCell.columnIndex],
    );

    return studyType;
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
      return new Set();
    }

    const studentsLastNameCell = this.findCellByContent(sheet, lastName);

    if (!studentsLastNameCell) {
      return new Set();
    }

    const disciplineInfoContentMap = this.initDisciplineInfoContentMap(sheet);
    const allDisciplineData =
      this.getAllDisciplineDataByStudentsLastNameCellCoords(
        sheet,
        [studentsLastNameCell.rowIndex, studentsLastNameCell.columnIndex],
        disciplineInfoContentMap,
      );

    return allDisciplineData;
  }

  private async findSheetByName(doc: GoogleSpreadsheet, query: string) {
    const sheetsByTitle = doc.sheetsByTitle;
    const sheet = sheetsByTitle[query];

    if (!sheet) {
      console.warn(`No sheet found for: ${query}`);
    }

    await sheet.loadCells();

    console.log(`cells loaded for sheet ${query}: `, sheet.cellStats);

    return sheet;
  }

  private findCellByContent(
    sheet: GoogleSpreadsheetWorksheet,
    query: string,
    {
      initialRow = 0,
      initialColumn = 0,
    }: {
      initialRow?: number;
      initialColumn?: number;
    } = {},
  ) {
    for (let row = initialRow; row < sheet.rowCount; row++) {
      for (let col = initialColumn; col < sheet.columnCount; col++) {
        const cell = sheet.getCell(row, col);
        const hasValue = cell.value !== undefined && cell.value !== null;
        const isQueryMatched =
          cell.value?.toString().toLowerCase().trim() === query.toLowerCase();

        if (hasValue && isQueryMatched) {
          console.log(cell.a1Address, cell.value);
          return cell;
        }
      }
    }

    console.warn(`Unable to find Cell by query - ${query}`);

    return null;
  }

  private getStudyFundingTypeByStudentsLastNameCellAddress(
    sheet: GoogleSpreadsheetWorksheet,
    targetCellAddress: CellCoords,
  ) {
    const [targetCellRow, targetCellCol] = targetCellAddress;

    const studyFundingTypeLabelCell = this.findCellByContent(
      sheet,
      // TODO: move to constant
      'Форма  фінансування навчання  студентів (бюджет/контракт)',
      {
        initialRow: targetCellRow,
      },
    );

    if (!studyFundingTypeLabelCell) {
      console.warn('Unable to find study funding type');
      return null;
    }

    const studyFundingTypeContentCell = sheet.getCell(
      studyFundingTypeLabelCell.rowIndex,
      targetCellCol,
    );

    return studyFundingTypeContentCell.value;
  }

  private getAllDisciplineDataByStudentsLastNameCellCoords(
    sheet: GoogleSpreadsheetWorksheet,
    targetCellCoords: CellCoords,
    contentMap: DisciplineContentMap[],
  ) {
    const [targetCellRowIndex, targetCellColIndex] = targetCellCoords;
    const contentStartRowIndexRelativeToTargetCell = targetCellRowIndex + 1;
    const allDisciplineDataList: Set<DisciplineResultMap> = new Set();

    let currRowIndex = contentStartRowIndexRelativeToTargetCell;
    while (true) {
      const currDisciplineData: DisciplineResultMap = new Map();
      const currDisciplineGradeCell = sheet.getCell(
        currRowIndex,
        targetCellColIndex,
      );

      currDisciplineData.set(
        GRADEBOOK_DISCIPLINE_DATA_INTERNAL_FIELDS.GRADE,
        currDisciplineGradeCell.value?.toString(),
      );
      currDisciplineData.set(
        GRADEBOOK_DISCIPLINE_DATA_INTERNAL_FIELDS.ACADEMIC_DEBT,
        this.hasAcademicDebt(currDisciplineGradeCell),
      );

      contentMap.forEach(({ columnIndex, label }) => {
        const content = sheet.getCell(currRowIndex, columnIndex);
        const value = content.value?.toString().trim();

        currDisciplineData.set(label, value);
      });

      // Iterating through discipline rows until the data is invalid
      // We assume that we reached the end of all discipline list for current student
      const isReachedEndOfAllDisciplineData =
        this.isDisciplineDataInvalid(currDisciplineData);

      if (isReachedEndOfAllDisciplineData) break;

      allDisciplineDataList.add(currDisciplineData);

      currRowIndex++;
    }

    return allDisciplineDataList;
  }

  private initDisciplineInfoContentMap(
    sheet: GoogleSpreadsheetWorksheet,
  ): DisciplineContentMap[] {
    return this.disciplineContentMapColList.map((columnIndex) => {
      const disciplineContentLabel = sheet.getCell(
        this.disciplineContentMapActualContentStartRow,
        columnIndex,
      );

      return {
        label: disciplineContentLabel.value?.toString().trim(),
        columnIndex,
      };
    });
  }

  private hasAcademicDebt(gradeCell: GoogleSpreadsheetCell) {
    // From the document statement:
    // Фактичні недопуски студентам проставляються напередодні сесії
    // шляхом позначення відповідної клітинки червоним маркером.
    return Boolean(
      'rgbColor' in gradeCell.backgroundColorStyle &&
      'red' in gradeCell.backgroundColorStyle.rgbColor,
      'red' in gradeCell.backgroundColorStyle.rgbColor &&
      gradeCell.backgroundColorStyle.rgbColor.red === 1 &&
      Object.keys(gradeCell.backgroundColorStyle.rgbColor).length === 1,
    );
  }

  private isDisciplineDataInvalid(disciplineData: DisciplineResultMap) {
    const disciplineMissingFields = [...disciplineData.values()].filter(
      (value) => !value,
    );

    return disciplineMissingFields.length >= this.missingFieldsThreshold;
  }
}
