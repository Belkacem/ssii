import React, { FunctionComponent, useEffect } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Avatar, List, Icon, Card } from 'antd';
import { countNotValidated as countNotValidatedExpenses } from 'app/application/entities/expense/expense.actions';
import { countNotValidated as countNotValidatedAbsences } from 'app/application/entities/absence/absence.actions';
import { getInvoices as getAllInvoices } from 'app/application/entities/invoice/invoice.actions';
import { Link } from 'react-router-dom';
import { IInvoice, InvoiceStatus } from 'app/shared/model/invoice.model';
import moment from 'moment';
import { getMissedFields } from 'app/application/modules/company/company-details/missing-field-alert';

interface INextActionsWidgetProps extends StateProps, DispatchProps {}

const today = moment();
const isOverDue = (invoice: IInvoice): boolean => invoice.status !== InvoiceStatus.PAID && today.diff(invoice.dueDate, 'days') > 0;

export const NextActionsWidget: FunctionComponent<INextActionsWidgetProps> = props => {
  const { pendingAbsences, pendingExpenses, resources, currentCompany, invoices } = props;
  const loading = props.loadingAbsences || props.loadingExpenses || props.loadingResources || props.loadingInvoices;
  useEffect(() => {
    props.countNotValidatedAbsences();
    props.countNotValidatedExpenses();
    props.getAllInvoices(0, 999, `issueDate,asc`);
  }, []);

  const actions = [];
  if (currentCompany && getMissedFields(currentCompany).length > 0) {
    actions.push({
      title: 'Informations manquantes',
      desc: <small>Certaines informations sur votre entreprise sont manquantes, veuillez les compléter SVP.</small>,
      icon: 'info',
      link: `/app/company/update?f=${getMissedFields(currentCompany)[0].name}`
    });
  }
  if (pendingAbsences > 0) {
    actions.push({
      title: 'Congés et Absences',
      desc: (
        <small>
          Vous avez <b>{pendingAbsences}</b> absences à valider
        </small>
      ),
      icon: 'calendar',
      link: '/app/company/absences'
    });
  }
  if (pendingExpenses > 0) {
    actions.push({
      title: 'Notes de frais',
      desc: (
        <small>
          Vous avez <b>{pendingExpenses}</b> notes de frais à valider
        </small>
      ),
      icon: 'euro',
      link: '/app/company/expenses'
    });
  }
  const draftResource = resources.filter(r => r.draft);
  if (draftResource.length > 0) {
    actions.push({
      title: 'Dossier des ressources incomplet',
      desc: (
        <small>
          Vous avez <b>{draftResource.length}</b> ressources brouillon
        </small>
      ),
      icon: 'team',
      link: '/app/company/resources'
    });
  }
  const overdueInvoices = invoices.filter(inv => isOverDue(inv));
  if (overdueInvoices.length > 0) {
    actions.push({
      title: 'Facture en retard',
      desc: (
        <small>
          Vous avez <b>{overdueInvoices.length}</b> facture en retard
        </small>
      ),
      icon: 'file-done',
      link: '/app/company/invoices?filter=OVERDUE'
    });
  }

  const renderActionItem = item => (
    <List.Item
      actions={[
        <Link key="open" to={item.link}>
          <Icon type="select" />
        </Link>
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar shape="square" icon={item.icon} />}
        title={<Link to={item.link}>{item.title}</Link>}
        description={item.desc}
      />
    </List.Item>
  );

  return (
    <Card title="À faire" size="small">
      <List loading={loading} itemLayout="horizontal" dataSource={actions} renderItem={renderActionItem} size="small" />
    </Card>
  );
};

const mapStateToProps = ({ application, resource, invoice }: IRootState) => ({
  currentCompany: application.company.current,
  pendingAbsences: application.absence.pending.totalItems,
  loadingAbsences: application.absence.pending.loading,
  pendingExpenses: application.expense.pending.totalItems,
  loadingExpenses: application.expense.pending.loading,
  resources: resource.entities,
  loadingResources: resource.loading,
  invoices: invoice.entities,
  loadingInvoices: invoice.loading
});

const mapDispatchToProps = {
  countNotValidatedAbsences,
  countNotValidatedExpenses,
  getAllInvoices
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(NextActionsWidget);
