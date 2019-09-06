import React, { FunctionComponent, useEffect, useState } from 'react';
import moment from 'moment';
import { Icon, Spin } from 'antd';
import { FORMAT_DATETIME } from 'app/application/common/config/constants';
import { ActivityReportValidationStatus, IActivityReportValidationStatus } from 'app/application/common/utils/activity-utils';

interface IActivityReportStatusProps {
  status: IActivityReportValidationStatus;
  loading?: boolean;
  showContent?: boolean;
}

export const ActivityReportStatus: FunctionComponent<IActivityReportStatusProps> = props => {
  const { status, loading = true, showContent = true } = props;
  if (loading) return <Spin size="small" spinning={loading} />;
  let content = '';
  let title: string;
  let icon;
  switch (status.validationStatus) {
    case ActivityReportValidationStatus.OVERDUE:
      title = 'En retard';
      icon = <Icon theme="twoTone" twoToneColor="#F44336" type="clock-circle" />;
      content = 'En retard';
      break;
    case ActivityReportValidationStatus.EDITABLE:
      title = 'En cours de création ...';
      icon = <Icon type="edit" theme="twoTone" twoToneColor="#009688" />;
      content = 'En cours de création ...';
      break;
    case ActivityReportValidationStatus.SUBMITED:
      title = `Soumis le ${moment(status.submissionDate).format(FORMAT_DATETIME)}`;
      icon = <Icon type="mail" theme="twoTone" />;
      content = 'Soumis';
      break;
    case ActivityReportValidationStatus.APPROVED:
      title = `Approuvé le ${moment(status.validationDate).format(FORMAT_DATETIME)}`;
      icon = <Icon type="check-circle" twoToneColor="#52c41a" theme="twoTone" />;
      content = 'Approuvé';
      break;
    case ActivityReportValidationStatus.REJECTED:
      title = `Refusé le ${moment(status.validationDate).format(FORMAT_DATETIME)}`;
      icon = <Icon type="close-circle" twoToneColor="red" theme="twoTone" />;
      content = 'Refusée';
      break;
    default:
    case ActivityReportValidationStatus.PENDING:
      title = 'En attente de validation';
      icon = <Icon type="clock-circle" theme="twoTone" />;
      content = 'En attente de validation';
      break;
  }

  return (
    <span title={title}>
      {icon} {showContent && content}
    </span>
  );
};
