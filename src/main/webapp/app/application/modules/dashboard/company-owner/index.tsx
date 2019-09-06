import React, { FunctionComponent } from 'react';
import { Col, Divider, Row } from 'antd';
import moment from 'moment';
import ResourcesCount from './resources-count';
import NextActionsWidget from './next-actions-widget';
import Shortcuts from './shortcuts';
import { Charts } from './charts';
import { ICompany } from 'app/shared/model/company.model';

interface IDashboardCompanyOwnerProps {
  account: any;
  currentCompany: ICompany;
}

export const DashboardCompanyOwner: FunctionComponent<IDashboardCompanyOwnerProps> = props => {
  const { account, currentCompany } = props;

  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div className="dashboard-head-title">
          <span>Bonjour {account.lastName},</span>
          <div className="dashboard-head-subtitle">
            Bienvenue au dashboard de <b>{currentCompany.name}</b>
            <Divider type="vertical" />
            <b>{moment().format('dddd DD MMMM YYYY')}</b>
          </div>
        </div>
        <div className="dashboard-head-extra">
          <ResourcesCount />
        </div>
      </div>
      <Shortcuts />
      <Row gutter={16}>
        <Col md={10}>
          <NextActionsWidget />
        </Col>
        <Col md={14}>
          <Charts />
        </Col>
      </Row>
    </div>
  );
};
