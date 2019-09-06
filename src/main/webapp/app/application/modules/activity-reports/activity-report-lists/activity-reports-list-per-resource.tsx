import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import * as ActivityReportList from 'app/application/entities/activity-report/activity-report-list.actions';
import moment, { Moment } from 'moment';
import { Empty, Icon } from 'antd';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { ActivityReportStatus } from 'app/application/modules/activity-reports/activity-report-status/status-item';
import ActivityReportPerMonth from '../activity-report-details/activity-report-by-month';
import List from 'app/application/components/list/list.component';
import { FORMAT_MONTH, FORMAT_MONTH_SERVER } from 'app/application/common/config/constants';
import { getValidationStatus } from 'app/application/common/utils/activity-utils';

interface IActivityReportsListProps extends StateProps, DispatchProps, RouteComponentProps<{ month }> {}

const ActivityReportsList: FunctionComponent<IActivityReportsListProps> = props => {
  const listRef = useRef<List>();
  const [dataList, setDataList] = useState([]);
  const { loading, projects, projectResources, standardActivities, exceptionalActivities, reports } = props;

  useEffect(
    () => {
      listRef.current.pushData(dataList);
    },
    [dataList]
  );

  useEffect(
    () => {
      if (projectResources.length > 0) {
        setData();
      }
    },
    [projectResources]
  );

  useEffect(
    () => {
      if (standardActivities.length > 0) {
        setStandardActivities();
      }
    },
    [standardActivities]
  );

  useEffect(
    () => {
      if (exceptionalActivities.length > 0) {
        setExceptionalActivities();
      }
    },
    [exceptionalActivities]
  );

  useEffect(
    () => {
      if (projects.length > 0) {
        setProjects();
      }
    },
    [projects]
  );

  const getEntities = () => props.getMyActivityReports();

  const setData = () => {
    const newDataList = [];
    reports.map(report => {
      const month = report.month;
      const projectResource = projectResources.find(pr => pr.id === report.projectResourceId);
      const record = newDataList.find(r => r.month === month);
      const startOfMonth = moment(month);
      const endOfMonth = moment(month).endOf('months');
      if (record) {
        record.projectResources.push(report.projectResourceId);
        record.reports.push(report);
        record.projectIds.push(projectResource.projectId);
        record.activities = getActivitiesByMonth(startOfMonth, endOfMonth);
        record.exceptionals = getExceptionalActivitiesByMonth(startOfMonth, endOfMonth);
      } else {
        newDataList.push({
          rowKey: startOfMonth.format(FORMAT_MONTH_SERVER),
          id: report.id,
          month: report.month,
          startOfMonth,
          endOfMonth,
          formattedMonth: startOfMonth.format(FORMAT_MONTH),
          projectResources: [report.projectResourceId],
          projectIds: [projectResource.projectId],
          projects: [],
          activities: getActivitiesByMonth(startOfMonth, endOfMonth),
          exceptionals: getExceptionalActivitiesByMonth(startOfMonth, endOfMonth),
          editable: report.editable,
          submitted: report.submitted,
          submissionDate: report.submissionDate,
          reports: [report]
        });
      }
    });
    setDataList(newDataList);
  };

  const getActivitiesByMonth = (startOfMonth: Moment, endOfMonth: Moment) =>
    standardActivities.filter(activity => moment(activity.date).isBetween(startOfMonth, endOfMonth, 'days', '[]'));

  const setStandardActivities = () => {
    const newDataList = [...dataList];
    newDataList.map((data, index) => {
      newDataList[index].activities = getActivitiesByMonth(data.startOfMonth, data.endOfMonth);
    });
    setDataList(newDataList);
  };

  const getExceptionalActivitiesByMonth = (startOfMonth: Moment, endOfMonth: Moment) =>
    exceptionalActivities.filter(activity => moment(activity.date).isBetween(startOfMonth, endOfMonth, 'days', '[]'));

  const setExceptionalActivities = () => {
    const newDataList = [...dataList];
    newDataList.map((data, index) => {
      newDataList[index].exceptionals = getExceptionalActivitiesByMonth(data.startOfMonth, data.endOfMonth);
    });
    setDataList(newDataList);
  };

  const setProjects = () => {
    const newDataList = [...dataList];
    newDataList.map((data, index) => {
      newDataList[index].projects = projects.filter(project => data.projectIds.includes(project.id));
    });
    setDataList(newDataList);
  };

  const handleFilterReports = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    return dataSource.filter(record => {
      const matchMonth = record.formattedMonth.match(reg);
      const matchProject = record.projects.some(project => project.nom.match(reg));
      return matchMonth || matchProject;
    });
  };

  const handleDetailsAction = record => {
    props.history.push(`/app/resource/my-activities/${moment(record.month).format(FORMAT_MONTH_SERVER)}`);
  };

  const renderReport = record => {
    const status = getValidationStatus(record.reports, record.activities, record.exceptionals);
    return (
      <div className="resource-meta">
        <Icon type="file-text" />
        <div className="meta-content">
          <span className="meta-title">{record.formattedMonth}</span>
          <span className="meta-description">{record.projects.map(p => p.nom).join(', ')}</span>
        </div>
        <div className="meta-status">
          <ActivityReportStatus status={status} loading={loading} showContent={false} />
        </div>
      </div>
    );
  };

  return (
    <List
      ref={listRef}
      rowKey="rowKey"
      totalItems={dataList.length}
      perPage={dataList.length}
      fetchData={getEntities}
      renderItem={renderReport}
      loading={loading}
      onClick={handleDetailsAction}
      onFilter={handleFilterReports}
      selectedItem={props.match.params.month}
      hasSelectedItem={!props.match.isExact || !!props.match.params.month}
      header={<PageHead title="Mes Rapports" margin={false} />}
    >
      <Switch>
        <Route path="/app/resource/my-activities/:month" component={ActivityReportPerMonth} />
        <>
          <Empty description="Aucun rapport d'activité sélectionné !" style={{ paddingTop: '5rem' }} />
        </>
      </Switch>
    </List>
  );
};

const mapStateToProps = ({ application }: IRootState) => ({
  resource: application.resource.current.entity,
  reports: application.activityReportList.reports,
  loading: application.activityReportList.loading,
  projectResources: application.activityReportList.projectResources,
  projects: application.activityReportList.projects,
  standardActivities: application.activityReportList.activities,
  exceptionalActivities: application.activityReportList.exceptionals
});

const mapDispatchToProps = {
  getMyActivityReports: ActivityReportList.getByCurrentResource
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(ActivityReportsList);
