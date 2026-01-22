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

  async getAllDisciplineGradesByStudentLastName(
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

  async findSheetByName(doc: GoogleSpreadsheet, query: string) {
    const sheetsByTitle = doc.sheetsByTitle;

    const res = Object.entries(sheetsByTitle).find(([title]) => {
      if (title.toLowerCase().startsWith(query)) {
        return true;
      }
    });

    if (!res) {
      return null;
    }

    const [, sheet] = res;

    await sheet.loadCells();

    console.log('cells loaded = ', sheet.cellStats);

    return sheet;
  }

  findA1AddressByContent(sheet: GoogleSpreadsheetWorksheet, query: string) {
    for (let row = 0; row < sheet.rowCount; row++) {
      for (let col = 0; col < sheet.columnCount; col++) {
        const cell = sheet.getCell(row, col);

        if (cell.value !== undefined && cell.value !== null) {
          if (
            cell.value.toString().toLowerCase().trim() === query.toLowerCase()
          ) {
            console.log(cell.a1Address, cell.value);
            return cell.a1Address;
          }
        }
      }
    }
  }

  getAllDisciplineDataByStudentsLastnameA1Address(
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
      const currDisciplineGrade = sheet.getCellByA1(
        `${targetCellCol}${currRow}`,
      );

      // TODO: remove hardcoded key
      currDisciplineData.set('Оцінка', currDisciplineGrade.value?.toString());
      contentMap.forEach(({ column, label }) => {
        const content = sheet.getCellByA1(`${column}${currRow}`);
        const value = content.value?.toString().trim();

        currDisciplineData.set(label, value);
      });

      const missingFields = [...currDisciplineData.values()].filter(
        (value) => !value,
      );

      if (missingFields.length >= this.missingFieldsThreshold) break;

      allDisciplineDataList.add(currDisciplineData);

      if (this.hasAcademicDebt(currDisciplineGrade)) {
        // TODO: remove hardcoded key
        currDisciplineData.set('Студент має академічну заборгованість', true);
      } else {
        currDisciplineData.set('Студент має академічну заборгованість', false);
      }

      allDisciplineDataList.add(currDisciplineData);

      currRow++;
    }

    return allDisciplineDataList;
  }

  initDisciplineInfoContentMap(
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

  hasAcademicDebt(gradeCell: GoogleSpreadsheetCell) {
    return (
      gradeCell.value &&
      'rgbColor' in gradeCell.backgroundColorStyle &&
      'red' in gradeCell.backgroundColorStyle.rgbColor
    );
  }
}
