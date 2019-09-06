export interface IExpenseJustification {
  id?: number;
  fileContentType?: string;
  file?: any;
  expenseId?: number;
}

export const defaultValue: Readonly<IExpenseJustification> = {};
