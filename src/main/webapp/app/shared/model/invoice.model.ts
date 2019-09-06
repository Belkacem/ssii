import { Moment } from 'moment';
import { IInvoice } from 'app/shared/model/invoice.model';
import { IInvoiceItem } from 'app/shared/model/invoice-item.model';

export const enum InvoiceType {
  INVOICE = 'INVOICE',
  CREDIT_NOTE = 'CREDIT_NOTE'
}

export const enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID'
}

export interface IInvoice {
  id?: number;
  number?: string;
  issueDate?: Moment;
  dueDate?: Moment;
  type?: InvoiceType;
  status?: InvoiceStatus;
  paymentDate?: Moment;
  projectId?: number;
  activityReportId?: number;
  nettingId?: number;
  companyId?: number;
  clientId?: number;
  notes?: IInvoice[];
  items?: IInvoiceItem[];
}

export const defaultValue: Readonly<IInvoice> = {};
