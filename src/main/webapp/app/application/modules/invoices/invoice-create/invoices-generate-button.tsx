import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { AUTHORITIES } from 'app/application/common/config/constants';
import { hasAnyAuthority } from 'app/application/common/utils/user-utils';
import { Button, Dropdown, Icon, Menu, Modal } from 'antd';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { getInvoiceName } from 'app/application/common/utils/invoice-utils';
import * as Invoice from 'app/application/entities/invoice/invoice.actions';
import { InvoiceStatus } from 'app/shared/model/invoice.model';
import moment, { Moment } from 'moment';

interface IInvoicesGenerateButtonProps extends StateProps, DispatchProps, RouteComponentProps {
  reports: ReadonlyArray<IActivityReport>;
  title?: string | ReactNode;
  size?: 'small' | 'large';
}

const InvoicesGenerateButton: FunctionComponent<IInvoicesGenerateButtonProps> = props => {
  const { title = '', size, generating } = props;
  const isCompanyOwner: boolean = hasAnyAuthority(props.account.authorities, [AUTHORITIES.COMPANY_OWNER]);
  const [reports, setReports] = useState([]);

  if (!isCompanyOwner) {
    return null;
  }

  useEffect(() => {
    props.resetGenerated();
    return () => {
      props.resetGenerated();
    };
  }, []);

  useEffect(
    () => {
      const _reports = props.reports
        .map(activityReport => {
          const project = getProject(activityReport);
          if (!!project) {
            const standardActivities = props.standardActivities.filter(
              act => act.activityReportId === activityReport.id && (act.morning || act.afternoon) && act.validationStatus === 'APPROVED'
            );
            const exceptionalActivities = props.exceptionalActivities.filter(
              act => act.activityReportId === activityReport.id && act.validationStatus === 'APPROVED'
            );
            const date = moment(activityReport.month).endOf('months');
            const hasProjectResourceInfo = existProjectResourcesInfo(activityReport.projectResourceId, date);
            const hasClient = !!project.clientId;
            const isValid = hasProjectResourceInfo && hasClient;
            return {
              id: activityReport.id,
              countStandardActivities: standardActivities.length,
              countExceptionalActivities: exceptionalActivities.length,
              isValid
            };
          }
        })
        .filter(r => !!r);
      setReports(_reports);
    },
    [props.reports]
  );

  useEffect(
    () => {
      if (!props.generating) {
        if (props.generatedInvoices.length > 0) {
          props.history.push(`/app/company/invoices/${props.generatedInvoices[0].id}`);
        }
      }
    },
    [props.generating]
  );

  const handleShowConfirmModal = () => {
    Modal.confirm({
      title: props.reports.length > 1 ? 'Générer des factures' : 'Générer une facture',
      content:
        props.reports.length > 1
          ? "Est que vous êtes sur de générer des nouveaux factures pour ces rapports d'activité séléctionner ?"
          : "Est que vous êtes sur de générer une nouvelle facture pour cette rapport d'activité séléctionner ?",
      okText: 'Générer',
      cancelText: 'Annuler',
      onOk: () => {
        const activityReportsIds = reports.filter(report => report.isValid).map(report => report.id);
        props.generateInvoice(activityReportsIds);
      }
    });
  };

  const getProject = activityReport => {
    if (props.reports.length === 1 && props.project.id) {
      return props.project;
    }
    const projectResource = props.projectResources.find(pr => pr.id === activityReport.projectResourceId);
    if (projectResource) {
      const project = props.projects.find(p => p.id === projectResource.projectId);
      if (project) {
        return project;
      }
    }
    return null;
  };

  const existProjectResourcesInfo = (projectResourceId: number, date: Moment) => {
    if (props.projectResourcesInfos.length > 0) {
      return props.projectResourcesInfos
        .filter(pri => pri.projectResourceId === projectResourceId)
        .some(pri => date.isSameOrAfter(pri.startDate, 'days'));
    }
    return false;
  };

  if (reports.filter(report => report.isValid).length === 0) {
    return null;
  }

  const invoices = props.invoices.filter(invoice => props.reports.some(report => invoice.activityReportId === report.id));
  const canGenerate = invoices.length > 0 && !invoices.some(invoice => invoice.status !== InvoiceStatus.DRAFT);
  if (invoices.length > 0) {
    return (
      <Dropdown
        overlay={
          <Menu>
            {invoices.map(invoice => (
              <Menu.Item key={`invoice-${invoice.id}`}>
                <Link to={`/app/company/invoices/${invoice.id}`}>
                  <Icon type="file-pdf" /> {getInvoiceName(invoice)}
                </Link>
              </Menu.Item>
            ))}
            {canGenerate && <Menu.Divider />}
            {canGenerate && (
              <Menu.Item key="generate" onClick={handleShowConfirmModal}>
                <Icon type="setting" /> Générer une nouvelle facture
              </Menu.Item>
            )}
          </Menu>
        }
      >
        <Button size={size} icon="setting" title="Facture" className="ant-btn-textual" loading={generating} children={title} />
      </Dropdown>
    );
  } else {
    return (
      <Button
        icon="setting"
        title="Générer une nouvelle facture"
        loading={generating}
        className="ant-btn-textual"
        onClick={handleShowConfirmModal}
        children={title}
        size={size}
      />
    );
  }
};

const mapStateToProps = ({
  application,
  authentication,
  client,
  invoice,
  invoiceItem,
  project,
  projectResource,
  projectResourceInfo
}: IRootState) => ({
  account: authentication.account,
  company: application.company.current,
  project: project.entity,
  projects: project.entities,
  standardActivities: application.standardActivity.entities,
  exceptionalActivities: application.exceptionalActivity.entities,
  projectResources: projectResource.entities,
  projectResourcesInfos: projectResourceInfo.entities,
  generating: application.invoice.generating,
  generatedInvoices: application.invoice.generated,
  invoices: invoice.entities
});

const mapDispatchToProps = {
  generateInvoice: Invoice.generate,
  resetGenerated: Invoice.reset
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(InvoicesGenerateButton));
