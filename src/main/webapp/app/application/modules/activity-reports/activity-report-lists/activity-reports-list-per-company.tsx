import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Link, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { IRootState } from 'app/shared/reducers';
import { Button, Empty, Icon } from 'antd';
import moment from 'moment';
import { ActivityReportStatus } from 'app/application/modules/activity-reports/activity-report-status/status-item';
import { FORMAT_DATE_SERVER, FORMAT_MONTH_SERVER } from 'app/application/common/config/constants';
import { PageHead } from 'app/application/common/layout/page-head/page-head';
import { Avatar } from 'app/application/components/avatar/avatar.component';
import List from 'app/application/components/list/list.component';

import * as ActivityReportList from 'app/application/entities/activity-report/activity-report-list.actions';
import { getFullName } from 'app/application/common/utils/resource-utils';
import ActivityReportsCreation from 'app/application/modules/activity-reports/activity-report-create/activity-reports-create';
import ActivityReportsValidation from 'app/application/modules/activity-reports/activity-report-details/activity-reports-by-resource-month';
import { getValidationStatus } from 'app/application/common/utils/activity-utils';
import { MonthFilter } from 'app/application/components/zsoft-form/custom-fields/monthFilter.component';
import { getUrlParameter } from 'app/application/common/utils/url-utils';
import { isOwner } from 'app/application/common/utils/user-utils';
import { orderBy } from 'lodash';

interface IActivityReportsListProps extends StateProps, DispatchProps, RouteComponentProps<{ resource_id; month }> {}

const ActivityReportsList: FunctionComponent<IActivityReportsListProps> = props => {
  const listRef = useRef<List>();
  const monthParam = getUrlParameter('month', props.location.search);
  const [month, setMonth] = useState(
    moment(monthParam, FORMAT_MONTH_SERVER).isValid() ? moment(monthParam).startOf('months') : moment().startOf('months')
  );
  const [dataList, setDataList] = useState([]);
  const { loading, projects, projectResources, resources, standardActivities, exceptionalActivities, reports } = props;
  const isCompanyOwner = isOwner(props.account, props.currentCompany);

  useEffect(
    () => {
      if (!!props.match.params.month && !month.isSame(props.match.params.month, 'month')) {
        setMonth(moment(props.match.params.month).startOf('months'));
      }
    },
    [props.match.params.month]
  );

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
        setActivities();
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
      if (resources.length > 0) {
        setResources();
      }
    },
    [resources]
  );

  useEffect(
    () => {
      if (projects.length > 0) {
        setProjects();
      }
    },
    [projects]
  );

  useEffect(
    () => {
      listRef.current.clearData();
      listRef.current.reload();
    },
    [month]
  );

  useEffect(
    () => {
      getEntities();
    },
    [props.updateSuccess]
  );

  const getEntities = () => {
    props.getActivityReportsPerMonth(month.format(FORMAT_DATE_SERVER));
  };

  const setData = () => {
    const newDataList = [];
    reports.map(report => {
      const projectResource = projectResources.find(pr => pr.id === report.projectResourceId);
      if (projectResource) {
        const record = newDataList.find(r => r.resourceId === projectResource.resourceId);
        if (record) {
          record.projectResources.push(report.projectResourceId);
          record.reports.push(report);
          record.projectIds.push(projectResource.projectId);
          record.activities = getActivitiesByReportIds(record.reports);
          record.exceptionals = getExceptionalActivitiesByReportIds(record.reports);
        } else {
          newDataList.push({
            rowKey: `${projectResource.resourceId}/${report.month}`,
            month: report.month,
            resourceId: projectResource.resourceId,
            resource: resources.find(r => r.id === projectResource.resourceId),
            projectResources: [report.projectResourceId],
            projectIds: [projectResource.projectId],
            projects: [],
            activities: getActivitiesByReportIds([report]),
            exceptionals: getExceptionalActivitiesByReportIds([report]),
            editable: report.editable,
            submitted: report.submitted,
            submissionDate: report.submissionDate,
            reports: [report]
          });
        }
      }
    });
    setDataList(orderBy(newDataList, ['resourceId'], ['asc']));
  };

  const getActivitiesByReportIds = (activityReportIds: any[]) =>
    standardActivities.filter(activity => activityReportIds.some(report => report.id === activity.activityReportId));

  const setActivities = () => {
    const newDataList = [...dataList];
    newDataList.map((data, index) => {
      newDataList[index].activities = getActivitiesByReportIds(data.reports);
    });
    setDataList(newDataList);
  };

  const getExceptionalActivitiesByReportIds = (activityReportIds: any[]) =>
    exceptionalActivities.filter(activity => activityReportIds.some(report => report.id === activity.activityReportId));

  const setExceptionalActivities = () => {
    const newDataList = [...dataList];
    newDataList.map((data, index) => {
      newDataList[index].exceptionals = getExceptionalActivitiesByReportIds(data.reports);
    });
    setDataList(newDataList);
  };

  const setResources = () => {
    const newDataList = [...dataList];
    newDataList.map((data, index) => {
      newDataList[index].resource = resources.find(r => r.id === data.resourceId);
    });
    setDataList(newDataList);
  };

  const getProjectsByIds = (projectIds: any[]) => projects.filter(project => projectIds.includes(project.id));

  const setProjects = () => {
    const newDataList = [...dataList];
    newDataList.map((data, index) => {
      newDataList[index].projects = getProjectsByIds(data.projectIds);
    });
    setDataList(newDataList);
  };

  const handleFilterReports = (dataSource, searchText) => {
    const reg = new RegExp(searchText, 'gi');
    return dataSource.filter(record => {
      const resourceName = record.resource ? getFullName(record.resource) : '';
      const matchResource = resourceName.match(reg);
      const matchProject = record.projects.some(project => project.nom.match(reg));
      return matchResource || matchProject;
    });
  };

  const handleDetailsAction = record => {
    let mode = 'edit';
    const status = getValidationStatus(record.reports, record.activities, record.exceptionals);
    if (status.validationStatus === 'PENDING' || status.validationStatus === 'SUBMITED') {
      mode = 'validate';
    } else if (status.validationStatus === 'APPROVED' || status.validationStatus === 'REJECTED') {
      mode = 'print';
    }
    props.history.push(`/app/company/activity-reports/${record.resourceId}/${record.month}?mode=${mode}`);
  };

  const renderReport = record => {
    const resourceName = record.resource ? getFullName(record.resource) : '';
    const status = getValidationStatus(record.reports, record.activities, record.exceptionals);
    return (
      <div className="resource-meta">
        <Avatar name={resourceName} size={28} />
        <div className="meta-content">
          <span className="meta-title">{resourceName}</span>
          <span className="meta-description">{record.projects.map(p => p.nom).join(', ')}</span>
        </div>
        <div className="meta-status">
          <ActivityReportStatus status={status} loading={props.loading} showContent={false} />
        </div>
      </div>
    );
  };
  const header = (
    <>
      <PageHead
        title="Rapports d'activités"
        margin={false}
        actions={
          isCompanyOwner && (
            <Button title="Crée un rapport des activités" type="primary" className="ant-btn-icon-only">
              <Link to={`/app/company/activity-reports/create?month=${month.format(FORMAT_MONTH_SERVER)}`}>
                <Icon type="plus" />
              </Link>
            </Button>
          )
        }
      />
      <Button.Group className="actions-bar">
        <MonthFilter value={month} setValue={setMonth} maxWidth />
      </Button.Group>
    </>
  );
  return (
    <List
      ref={listRef}
      rowKey="rowKey"
      fetchData={getEntities}
      renderItem={renderReport}
      totalItems={dataList.length}
      perPage={dataList.length}
      loading={loading}
      onClick={handleDetailsAction}
      onFilter={handleFilterReports}
      selectedItem={`${props.match.params.resource_id}/${props.match.params.month}`}
      hasSelectedItem={props.match.params[0] === 'create' || !props.match.isExact || !!props.match.params.month}
      header={header}
    >
      <Switch>
        <Route path="/app/company/activity-reports/create" component={ActivityReportsCreation} />
        <Route path="/app/company/activity-reports/:resource_id/:month" component={ActivityReportsValidation} />
        <>
          <Empty description="Aucun rapport d'activité sélectionné !" style={{ paddingTop: '5rem' }} />
        </>
      </Switch>
    </List>
  );
};

const mapStateToProps = ({ application, authentication, activityReport, invoice }: IRootState) => ({
  account: authentication.account,
  currentCompany: application.company.current,
  reports: application.activityReportList.reports,
  loading: application.activityReportList.loading,
  projectResources: application.activityReportList.projectResources,
  projects: application.activityReportList.projects,
  standardActivities: application.activityReportList.activities,
  exceptionalActivities: application.activityReportList.exceptionals,
  resources: application.activityReportList.resources,
  updateSuccess: activityReport.updateSuccess,
  invoiceUpdateSuccess: invoice.updateSuccess
});

const mapDispatchToProps = {
  getActivityReportsPerMonth: ActivityReportList.getByMonth
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivityReportsList);
