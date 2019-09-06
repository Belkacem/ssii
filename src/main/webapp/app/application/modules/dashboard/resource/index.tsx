import React, { FunctionComponent } from 'react';
import { Col, Divider, Row } from 'antd';
import moment from 'moment';
import { getFullName } from 'app/application/common/utils/resource-utils';
import { ICompany } from 'app/shared/model/company.model';
import { IResource } from 'app/shared/model/resource.model';
import Shortcuts from './shortcuts';
import AbsencesCount from './absences-count';
import NextActionsWidget from './next-actions-widget';

interface IDashboardResourceProps {
  resource: IResource;
  currentCompany: ICompany;
}

export const DashboardResource: FunctionComponent<IDashboardResourceProps> = props => {
  const { resource, currentCompany } = props;
  return (
    <div className="dashboard">
      <div className="dashboard-head">
        <div className="dashboard-head-title">
          <span>Bonjour {getFullName(resource)},</span>
          <div className="dashboard-head-subtitle">
            Bienvenue au dashboard de <b>{currentCompany.name}</b>
            <Divider type="vertical" />
            <b>{moment().format('dddd DD MMMM YYYY')}</b>
          </div>
        </div>
        <div className="dashboard-head-extra" style={{ width: 'max-content' }}>
          <AbsencesCount />
        </div>
      </div>
      <Shortcuts />
      <Row gutter={16}>
        <Col md={24}>
          <NextActionsWidget />
        </Col>
      </Row>
    </div>
  );
};
