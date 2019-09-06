export interface IExpenseType {
  id?: number;
  type?: string;
  code?: number;
}

export const defaultValue: Readonly<IExpenseType> = {};
