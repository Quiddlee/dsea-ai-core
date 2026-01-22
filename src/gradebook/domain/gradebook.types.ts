export type DisciplineContentMap = {
  label?: string;
  column: string;
};

export type DisciplineResult = {
  label?: string;
  value: string | boolean | null | undefined;
};

export type DisciplineResultMap = Map<
  DisciplineResult['label'],
  DisciplineResult['value']
>;
