import React, { FunctionComponent, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';
import { getValidationStatus, getValidationStatusList } from 'app/application/common/utils/activity-utils';
import { ActivityReportStatus } from './status-item';

interface IActivityReportStatusListProps {
  reports: ReadonlyArray<IActivityReport>;
  standardActivities: ReadonlyArray<IStandardActivity>;
  exceptionalActivities: ReadonlyArray<IExceptionalActivity>;
  loading?: boolean;
  showLast?: boolean;
  showContent?: boolean;
}

export const ActivityReportStatusList: FunctionComponent<IActivityReportStatusListProps> = props => {
  const { loading = true, showContent = true, showLast = false } = props;
  const [statusList, setStatusList] = useState([]);

  useEffect(
    () => {
      if (showLast) {
        setStatusList([getValidationStatus([...props.reports], [...props.standardActivities], [...props.exceptionalActivities])]);
      } else {
        setStatusList(getValidationStatusList([...props.reports], [...props.standardActivities], [...props.exceptionalActivities]));
      }
    },
    [props.reports, props.standardActivities, props.exceptionalActivities]
  );

  return (
    <Spin spinning={loading}>
      {statusList.map((status, key) => (
        <b key={key}>
          <small>
            <ActivityReportStatus status={status} showContent={showContent} loading={false} />
          </small>
          &nbsp;
        </b>
      ))}
    </Spin>
  );
};
