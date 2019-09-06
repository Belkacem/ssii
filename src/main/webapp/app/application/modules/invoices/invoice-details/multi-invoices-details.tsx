import React, { FunctionComponent } from 'react';
import { IInvoice, InvoiceStatus, InvoiceType } from 'app/shared/model/invoice.model';
import { IClient } from 'app/shared/model/client.model';
import { IInvoiceItem } from 'app/shared/model/invoice-item.model';
import { IProject } from 'app/shared/model/project.model';
import { formatMoney, getInvoiceName, getInvoiceTotal, getInvoiceTotalTVA } from 'app/application/common/utils/invoice-utils';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { InvoiceDetailsOverDue } from 'app/application/modules/invoices/invoice-details/invoice-details-overdue';
import { InvoiceDetailsStatus } from 'app/application/modules/invoices/invoice-details/invoice-details-status';
import { DateFormat } from 'app/application/components/date.format.component';
/* tslint:disable:no-submodule-imports */
import { Divider, Icon, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { FORMAT_DATE_SM } from 'app/application/common/config/constants';

interface IMultiInvoicesDetailsProps {
  invoices: IInvoice[];
  projects: ReadonlyArray<IProject>;
  clients: ReadonlyArray<IClient>;
  invoiceItems: ReadonlyArray<IInvoiceItem>;
}

export const MultiInvoicesDetails: FunctionComponent<IMultiInvoicesDetailsProps> = props => {
  const { invoices, clients, projects, invoiceItems } = props;
  const renderNumber = (invoice: IInvoice) => {
    const color = invoice.status === InvoiceStatus.DRAFT ? '#cbcbcb' : '#737679';
    return (
      <div className="invoice-number" style={{ background: color }} title={getInvoiceName(invoice)}>
        {invoice.type === InvoiceType.INVOICE ? 'FAC' : 'AV'}
        <div>
          <small>{('000' + invoice.id).slice(-3)}</small>
        </div>
      </div>
    );
  };

  const renderInvoiceRow = (data, invoice: IInvoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    const project = projects.find(p => p.id === invoice.projectId);
    return (
      <div className="invoice-row-details">
        {renderNumber(invoice)}
        <div className="invoice-description">
          {!!client && (
            <>
              {client.form} - <b>{client.name}</b>
            </>
          )}{' '}
          ({!!project && project.nom})
          <div className="invoice-small-line">
            Status:{' '}
            <b>
              <InvoiceDetailsStatus invoice={invoice} type="text" />
            </b>
            <Divider type="vertical" />
            <Icon type="calendar" />{' '}
            <b>
              <DateFormat value={invoice.issueDate} format={FORMAT_DATE_SM} />
            </b>
            <InvoiceDetailsOverDue invoice={invoice} divider />
          </div>
        </div>
      </div>
    );
  };

  const renderTotalTTC = (data, invoice: IInvoice) => {
    const items = invoiceItems.filter(item => item.invoiceId === invoice.id);
    return (
      <div className="invoice-row-totals">
        <h3>
          {formatMoney(getInvoiceTotal(items)) + ' '}
          <small>€</small>
        </h3>
        <small>TVA : {formatMoney(getInvoiceTotalTVA(items))} €</small>
      </div>
    );
  };

  const renderFooter = () => {
    const items = invoiceItems.filter(item => invoices.some(invoice => item.invoiceId === invoice.id));
    return (
      <div className="invoice-row-totals">
        <h3>
          <small className="text-muted">TOTAL </small>
          {formatMoney(getInvoiceTotal(items)) + ' '}
          <small>€</small>
        </h3>
        <small>TVA : {formatMoney(getInvoiceTotalTVA(items))} €</small>
      </div>
    );
  };

  const columns: Array<ColumnProps<IInvoice>> = [
    { title: 'Facture', dataIndex: 'nettingId', render: renderInvoiceRow },
    { title: 'Total (TTC)', dataIndex: 'id', render: renderTotalTTC, align: 'right' }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead title={`${invoices.length} factures séléctionner`} />
      </div>
      <div className="table-layout-body padding-1rem">
        <Table rowKey="id" columns={columns} dataSource={invoices} pagination={false} size="small" footer={renderFooter} />
      </div>
    </div>
  );
};
