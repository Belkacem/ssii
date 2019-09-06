import { Moment } from 'moment';

export interface IInvoiceItem {
  id?: number;
  name?: string;
  description?: string;
  date?: Moment;
  quantity?: number;
  unitPrice?: number;
  tax?: number;
  invoiceId?: number;
}

export const defaultValue: Readonly<IInvoiceItem> = {};
