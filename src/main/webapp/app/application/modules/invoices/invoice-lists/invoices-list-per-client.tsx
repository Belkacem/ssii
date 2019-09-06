import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Link, RouteComponentProps } from 'react-router-dom';
import * as Invoice from 'app/application/entities/invoice/invoice.actions';
import { IInvoice } from 'app/shared/model/invoice.model';
import { formatMoney, getInvoiceName, getInvoiceTotal, getInvoiceTotalTVA } from 'app/application/common/utils/invoice-utils';
import { FORMAT_DATE_SM, TABLE_PER_PAGE } from 'app/application/common/config/constants';
import { DateFormat } from 'app/application/components/date.format.component';
import { InvoiceDetailsOverDue } from 'app/application/modules/invoices/invoice-details/invoice-details-overdue';
import { InvoiceDetailsStatus } from 'app/application/modules/invoices/invoice-details/invoice-details-status';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
/* tslint:disable:no-submodule-imports */
import { Button, Divider, Icon, Modal, Pagination, Table, Dropdown, Menu } from 'antd';
import { ColumnProps, TableRowSelection } from 'antd/lib/table';
import { markInvoicesAsPaidModal } from 'app/application/modules/invoices/invoice-update/invoice-mark-as-paid-modal';

interface IInvoicesListProps extends StateProps, DispatchProps, RouteComponentProps {}

const InvoicesList: FunctionComponent<IInvoicesListProps> = props => {
  const tableRef: RefObject<Table<IInvoice>> = useRef<Table<IInvoice>>(null);
  const { invoicesList, totalItems, loading, sending, updating, downloading } = props;
  const [activePage, setActivePage] = useState(1);
  const [selectedInvoices, setSelectedInvoices] = useState<IInvoice[]>([]);

  useEffect(
    () => {
      loadData();
    },
    [activePage]
  );

  useEffect(
    () => {
      if (props.updateSuccess || props.client.id) {
        loadData();
      }
    },
    [props.updateSuccess, props.client.id]
  );

  const loadData = (sortBy = 'id', order = 'desc') => {
    const clientId = props.client.id;
    setSelectedInvoices([]);
    props.getInvoicesByClient(clientId, activePage - 1, TABLE_PER_PAGE, `${sortBy},${order}`);
  };

  const renderInvoiceRow = (data, invoice: IInvoice) => (
    <>
      <Link to={`/app/company/clients/details/${props.client.id}/invoices/${invoice.id}`}>{getInvoiceName(invoice)}</Link>
      <div>
        <small>
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
        </small>
      </div>
    </>
  );

  const renderTotalTTC = (data, invoice: IInvoice) => {
    const items = props.invoiceItems.filter(item => item.invoiceId === invoice.id);
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

  const renderRecordActions = (invoice: IInvoice) => {
    const handleOpen = () => handleDetailsAction(invoice);
    const handleSend = () => handleSendAction([invoice]);
    const handleDownload = () => handleDownloadAction([invoice]);
    const handleMarkAsPaid = () => handleMarkAsPaidAction([invoice]);
    const handleSendReminder = () => handleSendReminderAction([invoice]);
    const handleUpdate = () => handleUpdateInvoice(invoice);
    const handleCreateCreditNote = () => handleCreateCreditNoteAction(invoice);
    const handleDelete = () => handleDeleteInvoice([invoice]);
    return (
      <Button.Group>
        <Button onClick={handleOpen} icon="file-pdf" title="Ouvrir la facture" />
        {invoice.status === 'DRAFT' && <Button onClick={handleSend} loading={updating} icon="mail" title="Envoyer la facture" />}
        <Button onClick={handleDownload} icon="download" loading={downloading} title="Télécharger la facture" />
        {invoice.status === 'SENT' && <Button onClick={handleMarkAsPaid} icon="euro" title="Marquer comme payée" />}
        {invoice.status === 'SENT' && <Button onClick={handleSendReminder} loading={sending} icon="bell" title="Envoyer un rappel" />}
        {invoice.status !== 'DRAFT' &&
          !invoice.nettingId && <Button onClick={handleCreateCreditNote} icon="undo" title="Crée une facture d'avoir" />}
        {invoice.status === 'DRAFT' && <Button onClick={handleUpdate} icon="edit" title="Modifier" />}
        {invoice.status === 'DRAFT' && <Button onClick={handleDelete} icon="delete" title="Supprimer" />}
      </Button.Group>
    );
  };

  const renderMultiActions = () => {
    const handleOpen = () => handleDetailsAction(selectedInvoices[0]);
    const handleSend = () => handleSendAction(selectedInvoices);
    const handleDownload = () => handleDownloadAction(selectedInvoices);
    const handleMarkAsPaid = () => handleMarkAsPaidAction(selectedInvoices);
    const handleSendReminder = () => handleSendReminderAction(selectedInvoices);
    const handleUpdate = () => handleUpdateInvoice(selectedInvoices[0]);
    const handleCreateCreditNote = () => handleCreateCreditNoteAction(selectedInvoices[0]);
    const handleDelete = () => handleDeleteInvoice(selectedInvoices);

    const one_selection = selectedInvoices.length === 1;
    const all_draft = !selectedInvoices.some(invoice => invoice.status !== 'DRAFT');
    const all_sent = !selectedInvoices.some(invoice => invoice.status !== 'SENT');
    const can_netting = !selectedInvoices.some(invoice => invoice.status === 'DRAFT' || !!invoice.nettingId);
    const menu = (
      <Menu>
        {one_selection && (
          <Menu.Item onClick={handleOpen}>
            <Icon type="file-pdf" />
            <small>Ouvrir la facture</small>
          </Menu.Item>
        )}
        {all_draft && (
          <Menu.Item onClick={handleSend}>
            <Icon type="mail" />
            <small>Envoyer les factures</small>
          </Menu.Item>
        )}
        <Menu.Item onClick={handleDownload}>
          <Icon type="download" />
          <small>Télécharger les factures</small>
        </Menu.Item>
        {all_sent && (
          <Menu.Item onClick={handleMarkAsPaid}>
            <Icon type="euro" />
            <small>Marquer comme payée</small>
          </Menu.Item>
        )}
        {all_sent && (
          <Menu.Item onClick={handleSendReminder}>
            <Icon type="bell" />
            <small>Envoyer un rappel</small>
          </Menu.Item>
        )}
        {can_netting &&
          one_selection && (
            <Menu.Item onClick={handleCreateCreditNote}>
              <Icon type="undo" />
              <small>Crée une facture d'avoir</small>
            </Menu.Item>
          )}
        {all_draft &&
          one_selection && (
            <Menu.Item onClick={handleUpdate}>
              <Icon type="edit" />
              <small>Modifier</small>
            </Menu.Item>
          )}
        {all_draft && (
          <Menu.Item onClick={handleDelete}>
            <Icon type="delete" />
            <small>Supprimer</small>
          </Menu.Item>
        )}
      </Menu>
    );
    return (
      <Dropdown overlay={menu} className="ant-btn-textual" placement="bottomRight" disabled={selectedInvoices.length === 0}>
        <Button icon="setting" />
      </Dropdown>
    );
  };

  const handleDetailsAction = (invoice: IInvoice) =>
    props.history.push(`/app/company/clients/details/${props.client.id}/invoices/${invoice.id}`);

  const handleSendAction = (invoices: IInvoice[]) => {
    Modal.confirm({
      title: 'Envoyer la facture',
      content: "Êtes vous sûr d'envoyer cette facture au client ?",
      okText: 'Envoyer',
      cancelText: 'Annuler',
      onOk: () => {
        props.sendInvoicesEmail(invoices);
      }
    });
  };

  const handleSendReminderAction = (invoices: IInvoice[]) => {
    Modal.confirm({
      title: 'Envoyer un rappel',
      content: 'Est que vous êtes sur de envoyer un rappel au client de cette facture ?',
      okText: 'Envoyer',
      cancelText: 'Annuler',
      onOk: () => {
        props.sendInvoiceReminderEmail(invoices.map(invoice => invoice.id).join(','));
      }
    });
  };

  const handleMarkAsPaidAction = (invoices: IInvoice[]) => {
    markInvoicesAsPaidModal({
      invoices,
      onUpdate: (inv: IInvoice) => {
        props.markInvoiceAsPaid(inv);
      }
    });
  };

  const handleDownloadAction = (invoices: IInvoice[]) => invoices.map(invoice => props.downloadInvoice(invoice));

  const handleCreateCreditNoteAction = (invoice: IInvoice) =>
    props.history.push(`/app/company/clients/details/${props.client.id}/invoices/credit-note/create/${invoice.id}?sidebar=menu`);

  const handleUpdateInvoice = (invoice: IInvoice) =>
    props.history.push(`/app/company/clients/details/${props.client.id}/invoices/update/${invoice.id}?sidebar=menu`);

  const handleDeleteInvoice = (invoices: IInvoice[]) => {
    Modal.confirm({
      title: 'Suppression des factures',
      content: 'Est que vous êtes sur de supprimer ces factures ?',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        invoices.map(invoice => props.deleteInvoice(invoice.id));
      }
    });
  };

  const handleRefreshAction = () => loadData();

  const handleChangePage = (page: number) => setActivePage(page);

  const rowSelection: TableRowSelection<IInvoice> = {
    onChange: (selectedKeys, invoices: IInvoice[]) => {
      setSelectedInvoices(invoices);
    },
    selectedRowKeys: selectedInvoices.map(invoice => invoice.id)
  };

  const columns: Array<ColumnProps<IInvoice>> = [
    { title: 'Facture', dataIndex: 'nettingId', render: renderInvoiceRow },
    { title: 'Total (TTC)', dataIndex: 'id', render: renderTotalTTC },
    { title: <Icon type="setting" title="Actions" />, width: 96, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="table-layout-page">
      <div className="table-layout-head">
        <PageHead
          title="La Liste des factures"
          margin={false}
          actions={
            <Button.Group>
              <Button onClick={handleRefreshAction} icon="reload" className="ant-btn-textual">
                Actualiser
              </Button>
              {renderMultiActions()}
            </Button.Group>
          }
        />
      </div>
      <div className="table-layout-body">
        <Table
          ref={tableRef}
          rowKey="id"
          columns={columns}
          dataSource={[...invoicesList]}
          pagination={false}
          rowSelection={rowSelection}
          loading={loading}
          size="middle"
        />
      </div>
      <div className="table-layout-footer">
        <Pagination
          total={loading ? 0 : parseInt(totalItems + '', 10)}
          defaultCurrent={activePage}
          defaultPageSize={TABLE_PER_PAGE}
          onChange={handleChangePage}
          size="small"
        />
      </div>
    </div>
  );
};

const mapStateToProps = ({ application, client, invoice, invoiceItem }: IRootState) => ({
  invoicesList: invoice.entities,
  invoiceItems: invoiceItem.entities,
  client: client.entity,
  totalItems: invoice.totalItems,
  sending: application.invoice.sending,
  loading: invoice.loading,
  downloading: application.invoice.downloading,
  updateSuccess: invoice.updateSuccess,
  updating: invoice.updating
});

const mapDispatchToProps = {
  getInvoicesByClient: Invoice.getByClient,
  sendInvoiceReminderEmail: Invoice.sendReminderEmail,
  sendInvoicesEmail: Invoice.sendEmailBulk,
  markInvoiceAsPaid: Invoice.markAsPaid,
  downloadInvoice: Invoice.download,
  deleteInvoice: Invoice.deleteInvoice,
  markAsSent: Invoice.markAsSent
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvoicesList);
