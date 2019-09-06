import { IInvoiceItem } from 'app/shared/model/invoice-item.model';
import { IInvoice, InvoiceType } from 'app/shared/model/invoice.model';
import moment from 'moment';
import {
  DEFAULT_MONEY_PRECISION,
  DEFAULT_MONEY_SEPARATOR,
  FORMAT_DATETIME_SERVER,
  FORMAT_MONTH_SERVER
} from 'app/application/common/config/constants';
import { getHtmlPage } from 'app/application/common/utils/template-utils';
import { IInvoiceFile } from 'app/shared/model/invoice-file.model';

export const getInvoiceNumber = (invoice: IInvoice) =>
  `${invoice.type === InvoiceType.INVOICE ? '' : 'AV-'}${moment(invoice.issueDate, FORMAT_DATETIME_SERVER).format(FORMAT_MONTH_SERVER)}-${(
    '00000' + invoice.number
  ).slice(-5)}`;

export const getInvoiceName = (invoice: IInvoice) =>
  (invoice.type === InvoiceType.INVOICE ? 'Facture N° ' : "Facture d'avoir N° ") + getInvoiceNumber(invoice);

export const getInvoiceTotal = (invoiceItems: IInvoiceItem[]) => {
  let total = 0;
  invoiceItems.map(item => {
    const totalHT = item.quantity * item.unitPrice;
    const totalTVA = totalHT * (item.tax / 100);
    total += totalHT + totalTVA;
  });
  return total;
};

export const getInvoiceTotalTVA = (invoiceItems: IInvoiceItem[]) => {
  let totalTVA = 0;
  invoiceItems.map(item => {
    totalTVA += item.quantity * item.unitPrice * (item.tax / 100);
  });
  return totalTVA;
};

export const formatMoney = number => {
  if (typeof number === 'string') {
    number = parseFloat(number);
  }
  return number.toFixed(DEFAULT_MONEY_PRECISION).replace(/\d(?=(\d{3})+\.)/g, '$&' + DEFAULT_MONEY_SEPARATOR);
};

export const getInvoiceHtml = (invoiceFile: IInvoiceFile) => getHtmlPage(invoiceFile.file);
