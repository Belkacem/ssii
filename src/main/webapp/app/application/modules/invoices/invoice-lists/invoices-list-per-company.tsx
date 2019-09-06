import React, { FunctionComponent, useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Link, RouteComponentProps, Switch, Route } from 'react-router-dom';
import { getInvoiceName } from 'app/application/common/utils/invoice-utils';
import { FORMAT_DATE_SM, FORMAT_MONTH_SERVER } from 'app/application/common/config/constants';
import * as Invoice from 'app/application/entities/invoice/invoice.actions';
import { IInvoice, InvoiceStatus, InvoiceType } from 'app/shared/model/invoice.model';
import { Icon, Skeleton, Button, Menu, Dropdown, Badge, Empty, Modal } from 'antd';
import moment, { Moment } from 'moment';
import List, { IListActionProps } from 'app/application/components/list/list.component';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import InvoicesDetails from 'app/application/modules/invoices/invoice-details/invoice-details';
import { MultiInvoicesDetails } from 'app/application/modules/invoices/invoice-details/multi-invoices-details';
import CreditNoteCreate from 'app/application/modules/invoices/invoice-create/credit-note-create';
import InvoicesUpdate from 'app/application/modules/invoices/invoice-update/invoices-update';
import InvoicesCreate from 'app/application/modules/invoices/invoice-create/invoices-create';
import { DateFormat } from 'app/application/components/date.format.component';
import { MonthFilter } from 'app/application/components/zsoft-form/custom-fields/monthFilter.component';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import { InvoiceDetailsOverDue } from 'app/application/modules/invoices/invoice-details/invoice-details-overdue';
import { InvoiceDetailsStatus } from 'app/application/modules/invoices/invoice-details/invoice-details-status';
import { markInvoicesAsPaidModal } from 'app/application/modules/invoices/invoice-update/invoice-mark-as-paid-modal';

interface IInvoicesListProps extends StateProps, DispatchProps, RouteComponentProps<{ invoice_id }> {}

const UseSelectedInvoiceId = (invoiceId: string): string => {
  const [selected, setSelected] = useState(invoiceId);
  useEffect(
    () => {
      if (!!invoiceId) {
        setSelected(invoiceId);
      } else {
        setSelected(null);
      }
    },
    [invoiceId]
  );
  return selected;
};

const UseSelectedMonth = (monthParam: string, invoice: IInvoice): [Moment, (month: Moment) => void] => {
  const [month, setMonth] = useState<Moment>(
    moment(monthParam, FORMAT_MONTH_SERVER).isValid() ? moment(monthParam).startOf('months') : moment().startOf('months')
  );
  useEffect(
    () => {
      if (moment(monthParam, FORMAT_MONTH_SERVER).isValid()) {
        setMonth(moment(monthParam).startOf('months'));
      } else {
        setMonth(moment().startOf('months'));
      }
    },
    [monthParam]
  );
  useEffect(
    () => {
      if (!!invoice.issueDate && !!month && !month.isSame(invoice.issueDate, 'months')) {
        setMonth(moment(invoice.issueDate).startOf('months'));
      }
    },
    [invoice]
  );
  return [month, setMonth];
};

const UseFilterParam = (filterParam: string): [string, (filter: string) => void] => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  useEffect(
    () => {
      setStatusFilter(!!filterParam ? filterParam.toUpperCase() : 'ALL');
    },
    [filterParam]
  );
  return [statusFilter, setStatusFilter];
};

const InvoicesList: FunctionComponent<IInvoicesListProps> = props => {
  const listRef = useRef<List>();
  const filterParam = getUrlParameter('filter', props.location.search);
  const [statusFilter, setStatusFilter] = UseFilterParam(filterParam);
  const monthParam = getUrlParameter('month', props.location.search);
  const [month, setMonth] = UseSelectedMonth(monthParam, props.invoice);
  const selectedInvoiceId = UseSelectedInvoiceId(props.match.params.invoice_id);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  useEffect(
    () => {
      if (props.invoicesList.length > 0) {
        listRef.current.pushData(props.invoicesList);
      }
    },
    [props.invoicesList]
  );

  useEffect(
    () => {
      if (props.updateSuccess) {
        listRef.current.reload();
      }
    },
    [props.updateSuccess]
  );

  useEffect(
    () => {
      if (props.itemsUpdateSuccess) {
        listRef.current.reload();
      }
    },
    [props.itemsUpdateSuccess]
  );

  const getEntities = (activePage, perPage, sort, order) => {
    props.getInvoices(activePage - 1, perPage, `${sort},${order}`);
  };

  const renderNumber = invoice => {
    const color = invoice.status === InvoiceStatus.DRAFT ? '#cbcbcb' : '#737679';
    return (
      <div className="invoice-number" style={{ background: color }} title={getInvoiceName(invoice)}>
        {invoice.type === InvoiceType.INVOICE ? 'FAC' : 'AV'}
        <div>
          <small>{('000' + invoice.number).slice(-3)}</small>
        </div>
      </div>
    );
  };

  const renderClient = invoice => {
    const client = props.clients.find(c => c.id === invoice.clientId);
    if (client) {
      if (!!invoice.projectId) {
        const project = props.projects.find(p => p.id === invoice.projectId);
        if (!!project) {
          return `${client.name} (${project.nom})`;
        }
      }
      return client.name;
    }
    return false;
  };

  const renderInvoice = invoice => {
    const clientName = renderClient(invoice);
    return (
      <div className="invoice-row-details" title={clientName || ''}>
        {renderNumber(invoice)}
        <div className="invoice-description">
          {clientName || <Skeleton title={false} paragraph={{ rows: 1 }} active />}
          <div className="invoice-small-line">
            <b>
              <DateFormat value={invoice.issueDate} format={FORMAT_DATE_SM} />
            </b>
            <InvoiceDetailsOverDue invoice={invoice} divider />
          </div>
        </div>
        <div className="invoice-status">
          <InvoiceDetailsStatus invoice={invoice} type="icon" />
        </div>
      </div>
    );
  };

  const handleSelectInvoice = invoice => {
    props.history.push(`/app/company/invoices/${invoice.id}`);
  };

  const handleSelectInvoices = (invoices: IInvoice[]) => {
    if (invoices.length === 1 && `${invoices[0].id}` !== selectedInvoiceId) {
      props.history.push(`/app/company/invoices/${invoices[0].id}`);
    }
    setSelectedInvoices(invoices);
  };

  const handleStatuFilterInvoices = ({ key }) => {
    setStatusFilter(key);
  };

  const handleFilterInvoices = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    return dataSource
      .filter(invoice => {
        switch (statusFilter) {
          case 'DRAFT':
            return invoice.status === InvoiceStatus.DRAFT;
          case 'SENT':
            return invoice.status === InvoiceStatus.SENT;
          case 'PAID':
            return invoice.status === InvoiceStatus.PAID;
          case 'NOT_PAID':
            return invoice.status !== InvoiceStatus.PAID;
          case 'OVERDUE':
            return invoice.status !== InvoiceStatus.PAID && moment().diff(invoice.dueDate, 'days') > 0;
          default:
            return true;
        }
      })
      .filter(invoice => {
        if (!!month) {
          return month.isSame(invoice.issueDate, 'month');
        }
        return true;
      })
      .filter(invoice => {
        const matchNumber = getInvoiceName(invoice).match(reg);
        const matchClient = props.clients.some(c => c.id === invoice.clientId && c.name.match(reg) !== null);
        return matchNumber || matchClient;
      });
  };

  const filtersMenu = (
    <Menu mode="vertical" selectedKeys={[statusFilter]} onClick={handleStatuFilterInvoices}>
      <Menu.Item key="ALL">
        <small>Toutes les factures</small>
      </Menu.Item>
      <Menu.Item key="DRAFT">
        <Icon type="exclamation-circle" />
        <small>Brouillon</small>
      </Menu.Item>
      <Menu.Item key="SENT">
        <Icon theme="twoTone" twoToneColor="#108ee9" type="mail" />
        <small>Envoyée</small>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="PAID">
        <Icon theme="twoTone" twoToneColor="#52c41a" type="check-circle" />
        <small>Payée</small>
      </Menu.Item>
      <Menu.Item key="NOT_PAID">
        <Icon type="close-circle" />
        <small>Non payée</small>
      </Menu.Item>
      <Menu.Item key="OVERDUE">
        <Icon theme="twoTone" twoToneColor="#F44336" type="clock-circle" />
        <small>Retard</small>
      </Menu.Item>
    </Menu>
  );

  const handleSendAction = (invoices: IInvoice[]) => {
    Modal.confirm({
      title: 'Envoyer des factures',
      content: 'Est que vous êtes sur de envoyer cette factures au clients ?',
      okText: 'Envoyer',
      cancelText: 'Annuler',
      onOk: () => {
        props.sendInvoiceEmail(invoices);
      }
    });
  };

  const handleMarkAsSentAction = (invoices: IInvoice[]) => {
    Modal.confirm({
      title: (
        <>
          Marquer comme <b>Envoyée</b>
        </>
      ),
      content: (
        <>
          Est que vous êtes sur de marquer ces factures comme <b>"Envoyée"</b> ?
        </>
      ),
      okText: 'Confirmer',
      cancelText: 'Annuler',
      onOk: () => {
        invoices.map(invoice => props.markAsSent(invoice));
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

  const handleSendReminderAction = (invoices: IInvoice[]) => {
    Modal.confirm({
      title: 'Envoyer des rappels',
      content: 'Est que vous êtes sur de envoyer des rappels au clients de ces factures ?',
      okText: 'Envoyer',
      cancelText: 'Annuler',
      onOk: () => {
        props.sendInvoiceReminderEmail(invoices.map(invoice => invoice.id).join(','));
      }
    });
  };

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

  const handleCreateCreditNote = (invoice: IInvoice) =>
    props.history.push(`/app/company/invoices/credit-note/create/${invoice.id}?sidebar=menu`);

  const handleUpdateInvoice = (invoice: IInvoice) => props.history.push(`/app/company/invoices/update/${invoice.id}?sidebar=menu`);

  const handleDownloadAction = (invoices: IInvoice[]) => invoices.map(invoice => props.downloadInvoice(invoice));

  const { totalItems, loading } = props;

  const listActions: IListActionProps[] = [
    {
      title: 'Envoyer',
      icon: 'mail',
      onClick: invoices => handleSendAction(invoices),
      visible: invoices => !invoices.some(invoice => invoice.status !== 'DRAFT')
    },
    {
      title: 'Marquer comme envoyée',
      icon: 'audit',
      onClick: invoices => handleMarkAsSentAction(invoices),
      visible: invoices => !invoices.some(invoice => invoice.status !== 'DRAFT')
    },
    {
      title: 'Payée',
      icon: 'euro',
      onClick: invoices => handleMarkAsPaidAction(invoices),
      visible: invoices => !invoices.some(invoice => invoice.status !== 'SENT')
    },
    {
      title: 'Rappel',
      icon: 'bell',
      loading: props.sending,
      onClick: invoices => handleSendReminderAction(invoices),
      visible: invoices => !invoices.some(invoice => invoice.status !== 'SENT')
    },
    {
      title: 'Modifier',
      icon: 'edit',
      onClick: invoices => handleUpdateInvoice(invoices[0]),
      visible: invoices => invoices.length === 1 && !invoices.some(invoice => invoice.status !== 'DRAFT')
    },
    {
      title: 'Supprimer',
      icon: 'delete',
      onClick: invoices => handleDeleteInvoice(invoices),
      visible: invoices => !invoices.some(invoice => invoice.status !== 'DRAFT')
    },
    {
      title: "Créer une facture d'avoir",
      icon: 'undo',
      onClick: invoices => handleCreateCreditNote(invoices[0]),
      visible: invoices => invoices.length === 1 && !invoices.some(invoice => invoice.status !== 'DRAFT' || !!invoice.nettingId)
    },
    {
      title: 'Télécharger',
      icon: 'download',
      loading: props.downloading,
      onClick: invoices => handleDownloadAction(invoices)
    }
  ];

  const header = (
    <>
      <PageHead
        title="Factures"
        margin={false}
        actions={
          <>
            <Dropdown overlay={filtersMenu} placement="bottomRight">
              <Button className="ant-btn-icon-only" title="Filtrage">
                <Badge count={statusFilter !== 'ALL' ? 1 : 0} dot>
                  <Icon type="filter" />
                </Badge>
              </Button>
            </Dropdown>
            <Button title="Crée une facture" type="primary" className="ant-btn-icon-only">
              <Link to={`/app/company/invoices/create`}>
                <Icon type="plus" />
              </Link>
            </Button>
          </>
        }
      />
      <Button.Group className="actions-bar">
        <MonthFilter value={month} setValue={setMonth} maxWidth allowClear />
      </Button.Group>
    </>
  );
  return (
    <List
      ref={listRef}
      rowKey="id"
      totalItems={totalItems}
      renderItem={renderInvoice}
      fetchData={getEntities}
      onClick={handleSelectInvoice}
      onFilter={handleFilterInvoices}
      selectedItem={selectedInvoiceId}
      hasSelectedItem={!props.match.isExact || !!selectedInvoiceId}
      header={header}
      loading={loading}
      selectable
      actions={listActions}
      onSelect={handleSelectInvoices}
    >
      <Switch>
        <Route path="/app/company/invoices/credit-note/create/:invoice_id" component={CreditNoteCreate} />
        <Route path="/app/company/invoices/create" component={InvoicesCreate} />
        <Route path="/app/company/invoices/update/:invoice_id" component={InvoicesUpdate} />
        <Route path="/app/company/invoices/:invoice_id?">
          {!!selectedInvoiceId &&
            (selectedInvoices.length > 1 ? (
              <MultiInvoicesDetails
                invoices={selectedInvoices}
                clients={props.clients}
                projects={props.projects}
                invoiceItems={props.invoiceItems}
              />
            ) : (
              <Route path="/app/company/invoices/:invoice_id(\d+)?" component={InvoicesDetails} />
            ))}
        </Route>
        <>
          <Empty description="Aucun facture trouvé !" style={{ paddingTop: '5rem' }} />
        </>
      </Switch>
    </List>
  );
};

const mapStateToProps = ({ application, invoice, invoiceItem }: IRootState) => ({
  clients: application.invoiceList.clients,
  projects: application.invoiceList.projects,
  invoicesList: application.invoiceList.invoices,
  invoiceItems: application.invoiceList.invoiceItems,
  totalItems: application.invoiceList.totalItems,
  loading: application.invoiceList.loading,
  invoice: invoice.entity,
  updating: invoice.updating,
  updateSuccess: invoice.updateSuccess,
  itemsUpdateSuccess: invoiceItem.updateSuccess,
  sending: application.invoice.sending,
  downloading: application.invoice.downloading
});

const mapDispatchToProps = {
  getInvoices: Invoice.getPerCurrentCompany,
  markInvoiceAsPaid: Invoice.markAsPaid,
  sendInvoiceEmail: Invoice.sendEmailBulk,
  sendInvoiceReminderEmail: Invoice.sendReminderEmail,
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
