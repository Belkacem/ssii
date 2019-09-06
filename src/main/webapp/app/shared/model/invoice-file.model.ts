export interface IInvoiceFile {
  id?: number;
  fileContentType?: string;
  file?: any;
  invoiceId?: number;
}

export const defaultValue: Readonly<IInvoiceFile> = {};
