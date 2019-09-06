import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import { IRootState } from 'app/shared/reducers';
import { connect } from 'react-redux';
import * as ProjectExt from 'app/application/entities/project/project.actions';
import { InactiveAccount } from 'app/application/components/errors/inactive-account.component';
import { AccessDenied } from 'app/application/components/errors/access-denied.component';

import ActivitiesProjects from './activity-report-lists/projects-list';
import ActivityReportsList from './activity-report-lists/activity-reports-list-per-project';
import ActivityReportById from './activity-report-details/activity-report-by-id';

interface IActivitiesRoutesProps extends StateProps, DispatchProps, RouteComponentProps<{ project_id? }> {}

const ActivitiesRoutes: FunctionComponent<IActivitiesRoutesProps> = props => {
  const { currentValidators, currentContractors } = props;
  const projectIds =
    currentContractors.length > 0
      ? currentContractors.map(contractor => contractor.projectId)
      : currentValidators.map(validator => validator.projectId);

  useEffect(() => {
    // getProjectsList();
    if (projectIds.length > 0 && !props.match.params.project_id) {
      props.history.push(`/app/activities/p/${projectIds[0]}`);
    }
  }, []);

  const getProjectsList = () => {
    props.getProjects(projectIds);
  };

  const isAcriveProject = (projectId: number) => {
    const currentContractor = currentContractors.find(contractor => contractor.projectId === projectId);
    const currentValidator = currentValidators.find(validator => validator.projectId === projectId);
    if (!!currentContractor) {
      return currentContractor.active;
    } else if (!!currentValidator) {
      return currentValidator.active;
    }
    return false;
  };

  if (
    (currentValidators.length > 0 && currentValidators.filter(cv => cv.active).length === 0) ||
    (currentContractors.length > 0 && currentContractors.filter(cc => cc.active).length === 0)
  ) {
    return <InactiveAccount />;
  }
  if (currentValidators.length === 0 && currentContractors.length === 0) {
    return <AccessDenied />;
  }

  const routeSwitch = (
    <Switch>
      <Route path="/app/activities/p/:project_id/:report_id(\d+)" component={ActivityReportById} />
      <Route path="/app/activities/p/:project_id" component={ActivityReportsList} />
    </Switch>
  );

  return (
    <>
      {projectIds.length > 1 ? (
        <ActivitiesProjects
          projects={props.projectsList}
          loading={props.loadingProjects}
          getProjects={getProjectsList}
          isAcriveProject={isAcriveProject}
          children={routeSwitch}
        />
      ) : (
        routeSwitch
      )}
    </>
  );
};

const mapStateToProps = ({ application, project }: IRootState) => ({
  currentValidators: application.projectValidator.currents,
  currentContractors: application.projectContractor.currents,

  projectsList: project.entities,
  totalItems: project.totalItems,
  loadingProjects: project.loading
});
const mapDispatchToProps = {
  getProjects: ProjectExt.getProjectsIdIn
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ActivitiesRoutes));
