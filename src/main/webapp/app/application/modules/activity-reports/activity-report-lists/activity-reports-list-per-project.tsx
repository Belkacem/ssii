import React, { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Link, RouteComponentProps } from 'react-router-dom';
import * as ActivityReport from 'app/entities/activity-report/activity-report.reducer';
import * as ActivityReportExt from 'app/application/entities/activity-report/activity-report.actions';
import * as ProjectResourceExt from 'app/application/entities/project-resource/project-resource.actions';
import * as StandardActivityExt from 'app/application/entities/standard-activity/standard-activity.actions';
import * as ExceptionalActivityExt from 'app/application/entities/exceptional-activity/exceptional-activity.actions';
import * as ProjectResourceInfoExt from 'app/application/entities/project-resource-info/project-resource-info.actions';
import * as Invoice from 'app/application/entities/invoice/invoice.actions';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import moment from 'moment';
import { FORMAT_DATE_SERVER, FORMAT_MONTH, FORMAT_MONTH_SERVER } from 'app/application/common/config/constants';
import ResourceName from 'app/application/common/entities/resource-name';
import { ValidationStatus } from 'app/shared/model/standard-activity.model';
import { getValidationStatus } from 'app/application/common/utils/activity-utils';
import { ActivityReportStatus } from 'app/application/modules/activity-reports/activity-report-status/status-item';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import InvoicesGenerateButton from 'app/application/modules/invoices/invoice-create/invoices-generate-button';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import { isCurrentProjectValidator, isOwner } from 'app/application/common/utils/user-utils';
import { MonthFilter } from 'app/application/components/zsoft-form/custom-fields/monthFilter.component';
/* tslint:disable:no-submodule-imports */
import { Alert, Button, Icon, Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';

interface IActivityReportsListProps extends StateProps, DispatchProps, RouteComponentProps<{ project_id }> {}

const ActivityReportsList: FunctionComponent<IActivityReportsListProps> = props => {
  const tableRef: RefObject<Table<IActivityReport>> = useRef<Table<IActivityReport>>(null);
  const monthParam = getUrlParameter('month', props.location.search);
  const [month, setMonth] = useState(
    moment(monthParam, FORMAT_MONTH_SERVER).isValid() ? moment(monthParam).startOf('months') : moment().startOf('months')
  );
  const { loading, reports, projects, projectResources, standardActivities, exceptionalActivities, invoices } = props;
  const project = !!props.project ? props.project : projects.find(p => p.id === props.match.params.project_id);

  const isCompanyOwner = isOwner(props.account, props.currentCompany);
  const isValidator = props.currentProjectValidators.some(pv => isCurrentProjectValidator(pv, project));

  const listLink = isCompanyOwner
    ? `/app/company/projects/${props.match.params.project_id}/activity-reports`
    : `/app/activities${props.match.params.project_id ? '/p/' + props.match.params.project_id : ''}`;

  useEffect(
    () => {
      if (props.match.params.project_id) {
        props.getProjectResources(props.match.params.project_id, 0, 999, 'id,desc');
      }
    },
    [props.match.params.project_id]
  );

  useEffect(
    () => {
      loadData();
      if (projectResources.length > 0 && isCompanyOwner) {
        const projectResourceIds = projectResources.map(pr => pr.id);
        props.getProjectResourceInfosByProjectResources(projectResourceIds);
      }
    },
    [projectResources]
  );

  useEffect(
    () => {
      if (reports.length > 0) {
        const startOfMonth = month.format(FORMAT_DATE_SERVER);
        const endOfMonth = moment(month)
          .endOf('months')
          .format(FORMAT_DATE_SERVER);
        const activityReportIds = reports.map(report => report.id);
        props.getStandardActivitiesByReportsResourceAndDates(activityReportIds, startOfMonth, endOfMonth);
        props.getExceptionalActivitiesByReportsResourceAndDates(activityReportIds, startOfMonth, endOfMonth);
        if (isCompanyOwner) {
          props.getInvoicesByReportsIn(activityReportIds);
        }
      }
    },
    [reports]
  );

  useEffect(
    () => {
      if (props.invoiceUpdateSuccess) {
        props.history.push(`/app/company/projects/${props.match.params.project_id}/invoices`);
      }
    },
    [props.invoiceUpdateSuccess]
  );

  useEffect(
    () => {
      props.resetActivityReport();
      loadData();
    },
    [month]
  );

  const loadData = () => {
    const projectResourceIds = projectResources.map(pr => pr.id);
    if (projectResourceIds.length > 0) {
      props.getActivityReports(projectResourceIds, month.format(FORMAT_DATE_SERVER));
    }
  };

  const renderStatus = (submitted: boolean, record: IActivityReport) => {
    const activities = standardActivities.filter(act => act.activityReportId === record.id);
    const exceptionals = exceptionalActivities.filter(act => act.activityReportId === record.id);
    const status = getValidationStatus([record], activities, exceptionals);
    return <ActivityReportStatus status={status} showContent loading={loading} />;
  };

  const renderResource = (projectResourceId: number) => {
    const projectResource = projectResources.find(pr => pr.id === projectResourceId);
    return projectResource && <ResourceName resourceId={projectResource.resourceId} isMeta />;
  };

  const renderRecordActions = (id: number, record: IActivityReport) => {
    const activities = standardActivities.filter(act => act.activityReportId === id);
    const exceptionals = exceptionalActivities.filter(act => act.activityReportId === id);
    const status = getValidationStatus([record], activities, exceptionals);
    const mode = isValidator && (activities.length === 0 || status.validationStatus === 'PENDING') ? 'validate' : 'print';
    const canWrite = status.validationStatus === 'PENDING' && isValidator;
    const canRead = !canWrite && (activities.length > 0 || exceptionals.length > 0);
    const disabled = !canWrite && !canRead;
    const invoiceBtn = isCompanyOwner &&
      (status.validationStatus === 'APPROVED' || status.validationStatus === 'REJECTED') && <InvoicesGenerateButton reports={[record]} />;
    const { sending } = props;
    const handleReminder = () => handleSendReminder(id);
    return (
      <Button.Group>
        <Button
          href={canWrite || canRead ? `#${listLink}/${id}?mode=${mode}` : undefined}
          icon={canWrite ? 'check' : 'file-text'}
          title={canWrite ? 'Valider le rapport' : 'Voir le rapport'}
          loading={props.loadingStandardActivities}
          disabled={disabled}
          children={<small>{canWrite ? 'Valider' : 'Ouvrir'}</small>}
        />
        {invoiceBtn}
        {isValidator && !record.submitted && <Button icon="mail" title="Envoyer un rappel" loading={sending} onClick={handleReminder} />}
      </Button.Group>
    );
  };

  const handleSendReminder = reportId => {
    props.sendActivityReportReminder([reportId]);
  };

  const generateReportsInvoices = () => {
    const { loadingProjects, loadingInvoices, loadingStandardActivities } = props;
    if (!isCompanyOwner || loadingProjects || loading || loadingInvoices || loadingStandardActivities) {
      return false;
    }
    let reportsList = props.reports;
    reportsList = reportsList.filter(report => !invoices.some(invoice => invoice.activityReportId === report.id));
    reportsList = reportsList.filter(
      report =>
        !standardActivities.some(sa => sa.activityReportId === report.id && sa.validationStatus !== ValidationStatus.APPROVED) &&
        standardActivities.length > 0
    );
    reportsList = reportsList.filter(report => report.submitted && !report.editable);
    return (
      reportsList.length !== 0 &&
      !!project.clientId && (
        <Alert
          message={
            <>
              <div style={{ float: 'right' }}>
                <InvoicesGenerateButton reports={reports} title={<small>Générer</small>} size="small" />
              </div>
              <small>
                <b>
                  {reportsList.length} facture
                  {reportsList.length > 1 && 's'}
                </b>
                &nbsp; de 'Rapports d'activité du mois {month.format(FORMAT_MONTH)}' prêtes à être générées
              </small>
            </>
          }
          type="info"
          banner
          showIcon
        />
      )
    );
  };

  const columns: Array<ColumnProps<IActivityReport>> = [
    { title: 'Ressource', dataIndex: 'projectResourceId', render: renderResource },
    { title: 'Status', dataIndex: 'submitted', render: renderStatus, width: 200 },
    { title: <Icon type="setting" title="Actions" />, dataIndex: 'id', width: 50, align: 'center', render: renderRecordActions }
  ];

  return (
    <div className="page-layout">
      <div className="table-layout-page">
        <div className="table-layout-head">
          <PageHead
            title="La liste des rapports d'activités"
            margin={false}
            actions={
              <Button.Group>
                <MonthFilter value={month} setValue={setMonth} />
                {isCompanyOwner && (
                  <Button title="Crée un rapport des activités" type="primary">
                    <Link to={`/app/company/projects/${project.id}/activity-reports/create?month=${month.format(FORMAT_MONTH_SERVER)}`}>
                      <Icon type="plus" />
                    </Link>
                  </Button>
                )}
              </Button.Group>
            }
          />
        </div>
        {generateReportsInvoices()}
        <div className="table-layout-body">
          <Table
            ref={tableRef}
            rowKey="id"
            columns={columns}
            dataSource={[...reports]}
            pagination={false}
            loading={loading}
            size="middle"
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({ application, authentication, activityReport, invoice, project, projectResource }: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,
  reports: activityReport.entities,
  loading: activityReport.loading,
  sending: application.activityReport.sending,
  projectResources: projectResource.entities,
  project: project.entity,
  projects: project.entities,
  standardActivities: application.standardActivity.entities,
  loadingStandardActivities: application.standardActivity.loading,
  exceptionalActivities: application.exceptionalActivity.entities,
  loadingExceptionalActivities: application.exceptionalActivity.loading,
  currentProjectValidators: application.projectValidator.currents,
  currentProjectContractors: application.projectContractor.currents,
  invoiceUpdateSuccess: invoice.updateSuccess,
  invoices: invoice.entities,
  loadingProjects: project.loading,
  loadingInvoices: invoice.loading
});

const mapDispatchToProps = {
  getActivityReports: ActivityReportExt.getByProjectResourceAndMonth,
  resetActivityReport: ActivityReport.reset,
  getProjectResources: ProjectResourceExt.getByProject,
  getStandardActivitiesByReportsResourceAndDates: StandardActivityExt.getByActivityReportsAndDateBetween,
  getExceptionalActivitiesByReportsResourceAndDates: ExceptionalActivityExt.getByActivityReportsAndDateBetween,
  getProjectResourceInfosByProjectResources: ProjectResourceInfoExt.getByProjectResources,
  getInvoicesByReportsIn: Invoice.getByActivityReportsIn,
  sendActivityReportReminder: ActivityReportExt.sendReminder
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ActivityReportsList);
