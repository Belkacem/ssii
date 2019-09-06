import React, { FunctionComponent } from 'react';
import { Col, Row, Skeleton } from 'antd';
import { IInvoice } from 'app/shared/model/invoice.model';
import { IProject } from 'app/shared/model/project.model';
import { IClient } from 'app/shared/model/client.model';
import { IResource } from 'app/shared/model/resource.model';
import { IProjectResourceInfo } from 'app/shared/model/project-resource-info.model';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { formatMoney, getInvoiceNumber } from 'app/application/common/utils/invoice-utils';
import { getFullName } from 'app/application/common/utils/resource-utils';
import moment from 'moment';
import { FORMAT_MONTH } from 'app/application/common/config/constants';

interface ICreditNoteHeadProps {
  invoice: IInvoice;
  loading?: boolean;
  client?: IClient;
  loadingClient?: boolean;
  project?: IProject;
  loadingProject?: boolean;
  activityReport?: IActivityReport;
  loadingActivityReport?: boolean;
  resource?: IResource;
  loadingResource?: boolean;
  projectResourceInfos?: ReadonlyArray<IProjectResourceInfo>;
  loadingProjectResourceInfo?: boolean;
}

export const CreditNoteHead: FunctionComponent<ICreditNoteHeadProps> = props => {
  const { invoice, client, project, activityReport, resource, projectResourceInfos } = props;

  const projectResourceInfo = projectResourceInfos.find(pi => moment(pi.startDate).isSameOrBefore(invoice.issueDate));
  const dailyRate = !!projectResourceInfo ? projectResourceInfo.dailyRate : 0;
  const col = invoice.id && invoice.projectId ? (invoice.activityReportId ? 4 : 8) : 12;

  return (
    <Row type="flex" className="info-row">
      <Col lg={col} md={col} sm={12} xs={24}>
        <small>Facture N°</small>
        <div>
          <Skeleton title active paragraph={false} loading={props.loading}>
            <b>{getInvoiceNumber(invoice)}</b>
          </Skeleton>
        </div>
      </Col>
      {!!invoice.projectId && (
        <Col lg={col} md={col} sm={12} xs={24}>
          <small>Projet</small>
          <div>
            <Skeleton title active paragraph={false} loading={props.loadingProject}>
              <b>{project.nom}</b>
            </Skeleton>
          </div>
        </Col>
      )}
      {!!invoice.clientId && (
        <Col lg={col} md={col} sm={12} xs={24}>
          <small>Client</small>
          <div>
            <Skeleton title active paragraph={false} loading={props.loadingClient}>
              <b>{client.name}</b>
            </Skeleton>
          </div>
        </Col>
      )}
      {!!invoice.activityReportId && (
        <>
          <Col lg={col} md={col} sm={12} xs={24}>
            <small>Resource</small>
            <div>
              <Skeleton title active paragraph={false} loading={props.loadingResource}>
                <b>{getFullName(resource)}</b>
              </Skeleton>
            </div>
          </Col>
          <Col lg={col} md={col} sm={12} xs={24}>
            <small>Taux journalier</small>
            <div>
              <Skeleton title active paragraph={false} loading={props.loadingProjectResourceInfo}>
                <b>{formatMoney(dailyRate)}</b>
                &nbsp;
                <small>€</small>
              </Skeleton>
            </div>
          </Col>
          <Col lg={col} md={col} sm={12} xs={24}>
            <small>Rapport d'activité</small>
            <div>
              <Skeleton title active paragraph={false} loading={props.loadingActivityReport}>
                <b>{moment(activityReport.month).format(FORMAT_MONTH)}</b>
              </Skeleton>
            </div>
          </Col>
        </>
      )}
    </Row>
  );
};
