export type DisciplineContentMap = {
  label?: string;
  columnIndex: number;
};

export type DisciplineResult = {
  label?: string;
  value: string | boolean | null | undefined;
};

export type DisciplineResultDictionary = Record<
  string,
  DisciplineResult['value']
>;

export type CellCoords = readonly [row: number, col: number];
